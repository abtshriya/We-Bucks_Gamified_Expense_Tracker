# tests for api endpoints and tracker logic
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile, Expense, Subscription, SubscriptionRating


class UserSettingsAPITests(APITestCase):
    # test user settings endpoint
    def setUp(self):
        self.url = reverse('user-settings')

    def test_get_default_settings(self):
        # check default wage and balance
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['net_hourly_wage']), 600.00)
        self.assertEqual(response.data['currency_symbol'], '₹')
        self.assertEqual(float(response.data['available_balance']), 50000.00)

    def test_update_settings_success(self):
        # update hourly rate and currency
        payload = {'net_hourly_wage': 40.00, 'currency_symbol': '€'}
        response = self.client.put(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['net_hourly_wage']), 40.00)
        self.assertEqual(response.data['currency_symbol'], '€')

        # check db persistence
        profile = UserProfile.get_settings()
        self.assertEqual(profile.net_hourly_wage, Decimal('40.00'))

    def test_update_settings_invalid_wage(self):
        # reject negative or zero wage
        payload = {'net_hourly_wage': -10.00}
        response = self.client.put(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ExpenseAPITests(APITestCase):
    # test expense crud and life-hour conversion
    def setUp(self):
        self.profile = UserProfile.get_settings()
        self.profile.net_hourly_wage = Decimal('25.00')
        self.profile.save()
        self.url = reverse('expense-list')

    def test_create_expense_with_emotion_and_time_to_earn(self):
        # 50 spend at 25/hr should equal 2.0 hours
        payload = {
            'title': 'Impulse Tech Gadget',
            'amount': '50.00',
            'date': '2026-11-15',
            'category': 'shopping',
            'emotional_state': 'stressed',
            'description': 'Bought while overwhelmed with work deadlines'
        }
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['emotional_state'], 'stressed')
        self.assertEqual(response.data['hours_to_earn'], 2.0)

    def test_time_to_earn_dynamically_adapts_to_wage_change(self):
        # life-hours recalculate when wage changes
        expense = Expense.objects.create(
            title='Dinner with friends',
            amount=Decimal('75.00'),
            date='2026-11-10',
            category='dining',
            emotional_state='celebrating'
        )
        detail_url = reverse('expense-detail', kwargs={'pk': expense.id})

        # at 25/hr -> 75 / 25 = 3.0 hours
        res1 = self.client.get(detail_url)
        self.assertEqual(res1.data['hours_to_earn'], 3.0)

        # change wage to 50/hr -> 75 / 50 = 1.5 hours
        self.profile.net_hourly_wage = Decimal('50.00')
        self.profile.save()

        res2 = self.client.get(detail_url)
        self.assertEqual(res2.data['hours_to_earn'], 1.5)

    def test_filter_expenses_by_emotion(self):
        # filter expenses by emotional_state param
        Expense.objects.create(title='Coffee', amount=Decimal('5.00'), date='2026-11-01', emotional_state='hungry')
        Expense.objects.create(title='Shoes', amount=Decimal('80.00'), date='2026-11-02', emotional_state='bored')
        Expense.objects.create(title='Late snack', amount=Decimal('15.00'), date='2026-11-03', emotional_state='hungry')

        res = self.client.get(self.url, {'emotion': 'hungry'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        for item in res.data:
            self.assertEqual(item['emotional_state'], 'hungry')

    def test_dynamic_balance_update_on_expense_lifecycle(self):
        # balance decreases on expense create, and restores on delete
        initial_balance = UserProfile.get_settings().available_balance
        payload = {
            'title': 'Dinner Out',
            'amount': '150.00',
            'date': '2026-11-20',
            'category': 'dining',
            'emotional_state': 'content'
        }
        res = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        updated_balance = UserProfile.get_settings().available_balance
        self.assertEqual(updated_balance, initial_balance - Decimal('150.00'))

        # delete expense and verify restoration
        expense_id = res.data['id']
        del_url = reverse('expense-detail', kwargs={'pk': expense_id})
        del_res = self.client.delete(del_url)
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

        restored_balance = UserProfile.get_settings().available_balance
        self.assertEqual(restored_balance, initial_balance)


class SubscriptionRegretAPITests(APITestCase):
    # test subscription regret rating rules
    def setUp(self):
        self.subscription = Subscription.objects.create(
            name='Cloud Storage Pro',
            amount=Decimal('30.00'),
            billing_cycle='monthly',
            category='utilities'
        )
        self.rate_url = reverse('subscription-rate', kwargs={'pk': self.subscription.id})
        self.detail_url = reverse('subscription-detail', kwargs={'pk': self.subscription.id})

    def test_single_low_rating_does_not_flag_cancellation(self):
        # single rating under 4 should not trigger cancellation
        payload = {'rating_month': '2026-10', 'value_score': 2}
        response = self.client.post(self.rate_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        sub_data = response.data['subscription']
        self.assertEqual(sub_data['consecutive_low_count'], 1)
        self.assertFalse(sub_data['should_cancel'])

    def test_two_consecutive_low_ratings_triggers_should_cancel(self):
        # 2 months under 4 in a row flags should_cancel = True
        self.client.post(self.rate_url, data={'rating_month': '2026-10', 'value_score': 3}, format='json')
        res2 = self.client.post(self.rate_url, data={'rating_month': '2026-11', 'value_score': 2}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

        sub_data = res2.data['subscription']
        self.assertEqual(sub_data['consecutive_low_count'], 2)
        self.assertTrue(sub_data['should_cancel'])

    def test_high_rating_resets_cancellation_flag(self):
        # high rating >= 4 resets the cancellation flag
        self.client.post(self.rate_url, data={'rating_month': '2026-09', 'value_score': 2}, format='json')
        self.client.post(self.rate_url, data={'rating_month': '2026-10', 'value_score': 3}, format='json')

        check1 = self.client.get(self.detail_url)
        self.assertTrue(check1.data['should_cancel'])

        # rated 8/10 next month
        self.client.post(self.rate_url, data={'rating_month': '2026-11', 'value_score': 8}, format='json')

        check2 = self.client.get(self.detail_url)
        self.assertFalse(check2.data['should_cancel'])
        self.assertEqual(check2.data['consecutive_low_count'], 0)


class DashboardSummaryAPITests(APITestCase):
    # test summary calculations
    def setUp(self):
        self.profile = UserProfile.get_settings()
        self.profile.net_hourly_wage = Decimal('20.00')
        self.profile.save()

        Expense.objects.create(title='Groceries', amount=Decimal('60.00'), date='2026-11-01', emotional_state='hungry')
        Expense.objects.create(title='Stress buy', amount=Decimal('100.00'), date='2026-11-02', emotional_state='stressed')
        Expense.objects.create(title='Party', amount=Decimal('40.00'), date='2026-11-03', emotional_state='celebrating')

        sub = Subscription.objects.create(name='Unused Streaming', amount=Decimal('15.00'), billing_cycle='monthly')
        SubscriptionRating.objects.create(subscription=sub, rating_month='2026-10', value_score=2)
        SubscriptionRating.objects.create(subscription=sub, rating_month='2026-11', value_score=3)

        self.url = reverse('dashboard-summary')

    def test_dashboard_summary_metrics(self):
        # verify spend, life-hours and emotional breakdown
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        # total spend: 60 + 100 + 40 = 200.00
        self.assertEqual(data['total_spend'], 200.00)
        # life-hours: 200 / 20 = 10.0 hours
        self.assertEqual(data['total_hours'], 10.0)

        # emotional breakdown
        emotions = {item['emotion']: item for item in data['emotional_breakdown']}
        self.assertIn('stressed', emotions)
        self.assertEqual(emotions['stressed']['total'], 100.00)
        self.assertEqual(emotions['stressed']['percentage'], 50.0)
        self.assertEqual(emotions['stressed']['hours'], 5.0)

        # flagged subscriptions
        subs_summary = data['subscriptions_summary']
        self.assertEqual(subs_summary['flagged_count'], 1)
        self.assertEqual(subs_summary['potential_monthly_savings'], 15.00)
        self.assertEqual(subs_summary['flagged_subscriptions'][0]['name'], 'Unused Streaming')
