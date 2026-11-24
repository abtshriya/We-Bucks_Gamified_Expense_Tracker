from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import UserProfile, Expense, Subscription, SubscriptionRating
from .serializers import (
    UserProfileSerializer,
    ExpenseSerializer,
    SubscriptionSerializer,
    SubscriptionRatingSerializer,
)


class SettingsView(APIView):
    # get and update user settings (hourly wage, balance, currency)
    def get(self, request):
        profile = UserProfile.get_settings()
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = UserProfile.get_settings()
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)


class ExpenseViewSet(viewsets.ModelViewSet):
    # crud actions for expenses
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user_profile'] = UserProfile.get_settings()
        return context

    def get_queryset(self):
        # support query filters
        qs = Expense.objects.all()
        emotion = self.request.query_params.get('emotion')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if emotion:
            qs = qs.filter(emotional_state=emotion)
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)

        return qs


class SubscriptionViewSet(viewsets.ModelViewSet):
    # recurring subscription items
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user_profile'] = UserProfile.get_settings()
        return context

    @action(detail=True, methods=['post'], url_path='rate')
    def rate(self, request, pk=None):
        # save or update a monthly 1-10 rating
        subscription = self.get_object()
        rating_month = request.data.get('rating_month')
        value_score = request.data.get('value_score')
        notes = request.data.get('notes', '')

        if not rating_month or value_score is None:
            return Response(
                {"error": "rating_month and value_score (1-10) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            value_score_int = int(value_score)
            if value_score_int < 1 or value_score_int > 10:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {"error": "value_score must be an integer between 1 and 10."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating_obj, created = SubscriptionRating.objects.update_or_create(
            subscription=subscription,
            rating_month=rating_month,
            defaults={'value_score': value_score_int, 'notes': notes}
        )

        serializer = SubscriptionSerializer(subscription, context=self.get_serializer_context())
        return Response({
            "rating": SubscriptionRatingSerializer(rating_obj).data,
            "subscription": serializer.data
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class DashboardSummaryView(APIView):
    # combines totals, vault balance, emotions and cursed subs
    def get(self, request):
        profile = UserProfile.get_settings()
        hourly_wage = float(profile.net_hourly_wage)

        now = timezone.localtime(timezone.now())
        current_month_str = now.strftime('%Y-%m')

        # total and monthly spend
        all_expenses = Expense.objects.all()
        month_expenses = all_expenses.filter(date__year=now.year, date__month=now.month)

        total_spend = float(all_expenses.aggregate(total=Sum('amount'))['total'] or 0.0)
        month_spend = float(month_expenses.aggregate(total=Sum('amount'))['total'] or 0.0)

        total_hours = round(total_spend / hourly_wage, 2) if hourly_wage > 0 else 0.0
        month_hours = round(month_spend / hourly_wage, 2) if hourly_wage > 0 else 0.0

        # group expenses by emotional trigger
        emotion_dict = dict(Expense.EMOTION_CHOICES)
        emotion_totals = (
            all_expenses.values('emotional_state')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )

        emotional_breakdown = []
        for entry in emotion_totals:
            emotion_key = entry['emotional_state']
            amt = float(entry['total'])
            pct = round((amt / total_spend * 100), 1) if total_spend > 0 else 0.0
            hrs = round(amt / hourly_wage, 2) if hourly_wage > 0 else 0.0

            emotional_breakdown.append({
                'emotion': emotion_key,
                'label': emotion_dict.get(emotion_key, emotion_key.title()),
                'total': amt,
                'percentage': pct,
                'hours': hrs,
                'count': entry['count']
            })

        # breakdown by category
        category_dict = dict(Expense.CATEGORY_CHOICES)
        category_totals = (
            all_expenses.values('category')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )
        category_breakdown = [
            {
                'category': entry['category'],
                'label': category_dict.get(entry['category'], entry['category'].title()),
                'total': float(entry['total']),
                'count': entry['count']
            }
            for entry in category_totals
        ]

        # check active subscriptions and low rating flags
        active_subscriptions = Subscription.objects.filter(is_active=True)
        total_monthly_recurring = 0.0
        flagged_for_cancellation = []
        potential_monthly_savings = 0.0

        for sub in active_subscriptions:
            amt = float(sub.amount)
            monthly_cost = amt if sub.billing_cycle == 'monthly' else (amt / 12.0)
            total_monthly_recurring += monthly_cost

            status_info = sub.get_rating_status()
            if status_info['should_cancel']:
                potential_monthly_savings += monthly_cost
                last_two = list(sub.ratings.order_by('-rating_month')[:2])
                scores_str = ", ".join([f"{r.rating_month}: {r.value_score}/10" for r in last_two])
                flagged_for_cancellation.append({
                    'id': sub.id,
                    'name': sub.name,
                    'amount': amt,
                    'billing_cycle': sub.billing_cycle,
                    'monthly_cost': round(monthly_cost, 2),
                    'consecutive_low_count': status_info['consecutive_low_count'],
                    'ratings_summary': scores_str,
                    'reason': f"Rated below 4 for 2 consecutive months ({scores_str})"
                })

        # treasury vault calculations
        available_balance = float(profile.available_balance)
        yet_to_pay = round(total_monthly_recurring, 2)
        spendable_balance = round(available_balance - yet_to_pay, 2)
        spendable_hours = round(spendable_balance / hourly_wage, 1) if hourly_wage > 0 else 0.0

        return Response({
            'currency_symbol': profile.currency_symbol,
            'net_hourly_wage': hourly_wage,
            'available_balance': round(available_balance, 2),
            'yet_to_pay': yet_to_pay,
            'spendable_balance': spendable_balance,
            'spendable_hours': spendable_hours,
            'current_month': current_month_str,
            'total_spend': round(total_spend, 2),
            'total_hours': total_hours,
            'month_spend': round(month_spend, 2),
            'month_hours': month_hours,
            'expenses_count': all_expenses.count(),
            'emotional_breakdown': emotional_breakdown,
            'category_breakdown': category_breakdown,
            'subscriptions_summary': {
                'active_count': active_subscriptions.count(),
                'total_monthly_recurring': round(total_monthly_recurring, 2),
                'flagged_count': len(flagged_for_cancellation),
                'potential_monthly_savings': round(potential_monthly_savings, 2),
                'flagged_subscriptions': flagged_for_cancellation,
            }
        }, status=status.HTTP_200_OK)
