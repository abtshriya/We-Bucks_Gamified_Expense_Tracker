from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class UserProfile(models.Model):
    # user settings: hourly rate, currency symbol, and bank balance
    net_hourly_wage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('600.00'),
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Net hourly rate"
    )
    currency_symbol = models.CharField(max_length=5, default="₹")
    available_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('50000.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Total available balance"
    )
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_settings(cls):
        # singleton profile record
        profile, _ = cls.objects.get_or_create(id=1)
        return profile

    def __str__(self):
        return f"Settings ({self.currency_symbol}{self.net_hourly_wage}/h)"


class Expense(models.Model):
    # expense entry with emotional trigger
    EMOTION_CHOICES = [
        ('stressed', 'Stressed'),
        ('celebrating', 'Celebrating'),
        ('bored', 'Bored'),
        ('hungry', 'Hungry'),
        ('peer_pressured', 'Peer Pressure'),
        ('content', 'Calm / Content'),
        ('impulsive', 'Impulsive'),
    ]

    CATEGORY_CHOICES = [
        ('dining', 'Food & Dining'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('utilities', 'Bills & Utilities'),
        ('transport', 'Transportation'),
        ('health', 'Health & Fitness'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=120)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    date = models.DateField(default=timezone.now)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='dining')
    emotional_state = models.CharField(max_length=30, choices=EMOTION_CHOICES, default='content')
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def calculate_hours_worked(self, hourly_wage=None):
        # convert spend to hours of work
        if hourly_wage is None or hourly_wage <= 0:
            profile = UserProfile.get_settings()
            hourly_wage = profile.net_hourly_wage

        if hourly_wage and hourly_wage > 0:
            return round(float(self.amount) / float(hourly_wage), 2)
        return 0.0

    def __str__(self):
        return f"{self.title} - {self.amount}"


class Subscription(models.Model):
    # recurring monthly or yearly subscription
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=120)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    billing_cycle = models.CharField(max_length=15, choices=BILLING_CYCLE_CHOICES, default='monthly')
    category = models.CharField(max_length=30, choices=Expense.CATEGORY_CHOICES, default='entertainment')
    start_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def get_rating_status(self):
        # check if rated under 4 for 2 consecutive months
        ratings = list(self.ratings.order_by('-rating_month'))
        consecutive_low = 0
        for rating in ratings:
            if rating.value_score < 4:
                consecutive_low += 1
            else:
                break

        should_cancel = consecutive_low >= 2
        latest_score = ratings[0].value_score if ratings else None
        latest_month = ratings[0].rating_month if ratings else None

        return {
            'consecutive_low_count': consecutive_low,
            'should_cancel': should_cancel,
            'latest_score': latest_score,
            'latest_month': latest_month,
            'total_ratings': len(ratings),
        }

    def __str__(self):
        return f"{self.name} ({self.amount}/{self.billing_cycle})"


class SubscriptionRating(models.Model):
    # monthly 1-10 regret / value rating
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='ratings')
    rating_month = models.CharField(max_length=7)  # YYYY-MM
    value_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('subscription', 'rating_month')
        ordering = ['-rating_month']

    def __str__(self):
        return f"{self.subscription.name} - {self.rating_month}: {self.value_score}"
