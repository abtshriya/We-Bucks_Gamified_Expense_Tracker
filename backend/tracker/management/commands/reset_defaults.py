from decimal import Decimal
from django.core.management.base import BaseCommand
from tracker.models import UserProfile, Expense, Subscription, SubscriptionRating


class Command(BaseCommand):
    help = 'Resets all tracker data to clean default starting state for a new user'

    def handle(self, *args, **options):
        # 1. Clear all expenses
        exp_count = Expense.objects.all().delete()[0]

        # 2. Clear all subscription ratings and subscriptions
        rating_count = SubscriptionRating.objects.all().delete()[0]
        sub_count = Subscription.objects.all().delete()[0]

        # 3. Reset user settings to fresh defaults
        profile = UserProfile.get_settings()
        profile.net_hourly_wage = Decimal('600.00')
        profile.currency_symbol = '₹'
        profile.available_balance = Decimal('50000.00')
        profile.save()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully reset to defaults: deleted {exp_count} expenses, "
            f"{sub_count} subscriptions, {rating_count} ratings. "
            f"Available balance reset to ₹50,000.00 and wage to ₹600.00/h."
        ))
