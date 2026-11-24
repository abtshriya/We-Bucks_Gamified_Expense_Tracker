from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from tracker.models import UserProfile, Expense, Subscription, SubscriptionRating


class Command(BaseCommand):
    help = 'Seeds initial sample data in Indian context'

    def handle(self, *args, **options):
        profile = UserProfile.get_settings()
        profile.net_hourly_wage = Decimal('600.00')
        profile.currency_symbol = '₹'
        profile.available_balance = Decimal('50000.00')
        profile.save()

        Expense.objects.all().delete()
        Subscription.objects.all().delete()

        now = timezone.now().date()
        expenses_data = [
            {
                'title': 'Swiggy - Late Night Biryani',
                'amount': Decimal('460.00'),
                'date': now - timedelta(days=1),
                'category': 'dining',
                'emotional_state': 'stressed',
                'description': 'Ordered while finishing client presentation'
            },
            {
                'title': 'Blue Tokai - Coffee & Croissant',
                'amount': Decimal('340.00'),
                'date': now - timedelta(days=2),
                'category': 'dining',
                'emotional_state': 'hungry',
                'description': 'Quick evening bite'
            },
            {
                'title': 'Drinks & Dinner at Toit',
                'amount': Decimal('2200.00'),
                'date': now - timedelta(days=3),
                'category': 'dining',
                'emotional_state': 'celebrating',
                'description': 'Celebrated sprint release with team'
            },
            {
                'title': 'Blinkit - Midnight Snacks',
                'amount': Decimal('380.00'),
                'date': now - timedelta(days=5),
                'category': 'shopping',
                'emotional_state': 'bored',
                'description': 'Late night impulse munching'
            },
            {
                'title': 'Dinner Split at Social',
                'amount': Decimal('1450.00'),
                'date': now - timedelta(days=7),
                'category': 'dining',
                'emotional_state': 'peer_pressured',
                'description': 'Large group bill split evenly'
            },
            {
                'title': 'Metro SmartCard Recharge',
                'amount': Decimal('1000.00'),
                'date': now - timedelta(days=10),
                'category': 'transport',
                'emotional_state': 'content',
                'description': 'Monthly work commute pass'
            },
            {
                'title': 'Zepto - Weekly Groceries & Dairy',
                'amount': Decimal('890.00'),
                'date': now - timedelta(days=12),
                'category': 'dining',
                'emotional_state': 'content',
                'description': 'Milk, veggies, and pantry restock'
            },
            {
                'title': 'Myntra - Impulse Sneaker Sale',
                'amount': Decimal('2899.00'),
                'date': now - timedelta(days=14),
                'category': 'shopping',
                'emotional_state': 'impulsive',
                'description': 'Limited time flash discount'
            },
        ]

        for exp in expenses_data:
            Expense.objects.create(**exp)

        # 1. Underutilized Gym Pass (flagged: 2/10 and 3/10 for 2 consecutive months)
        cult = Subscription.objects.create(
            name='Cult.fit Elite Pass',
            amount=Decimal('1499.00'),
            billing_cycle='monthly',
            category='health',
            start_date=now - timedelta(days=90),
            is_active=True
        )
        SubscriptionRating.objects.create(
            subscription=cult,
            rating_month=(now - timedelta(days=40)).strftime('%Y-%m'),
            value_score=2,
            notes='Barely visited twice this month, classes always waitlisted.'
        )
        SubscriptionRating.objects.create(
            subscription=cult,
            rating_month=now.strftime('%Y-%m'),
            value_score=3,
            notes='Still paying ₹1,499 with minimal attendance, cancel or pause.'
        )

        # 2. Regularly used music streaming
        spotify = Subscription.objects.create(
            name='Spotify Premium Individual',
            amount=Decimal('119.00'),
            billing_cycle='monthly',
            category='entertainment',
            start_date=now - timedelta(days=180),
            is_active=True
        )
        SubscriptionRating.objects.create(
            subscription=spotify,
            rating_month=(now - timedelta(days=40)).strftime('%Y-%m'),
            value_score=9,
            notes='Daily use during commute and focus work'
        )
        SubscriptionRating.objects.create(
            subscription=spotify,
            rating_month=now.strftime('%Y-%m'),
            value_score=9,
            notes='Indispensable'
        )

        # 3. Cloud storage
        Subscription.objects.create(
            name='Google One 100GB',
            amount=Decimal('130.00'),
            billing_cycle='monthly',
            category='utilities',
            start_date=now - timedelta(days=60),
            is_active=True
        )

        self.stdout.write(self.style.SUCCESS("Demo dataset populated in Indian context."))
