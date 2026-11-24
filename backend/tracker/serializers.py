from rest_framework import serializers
from django.utils import timezone
from .models import UserProfile, Expense, Subscription, SubscriptionRating


class UserProfileSerializer(serializers.ModelSerializer):
    # serializer for hourly wage and available balance
    class Meta:
        model = UserProfile
        fields = ['id', 'net_hourly_wage', 'currency_symbol', 'available_balance', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def validate_net_hourly_wage(self, value):
        if value <= 0:
            raise serializers.ValidationError("Hourly rate must be greater than zero.")
        return value

    def validate_available_balance(self, value):
        if value < 0:
            raise serializers.ValidationError("Available balance cannot be negative.")
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    # expense serializer with computed hours to earn
    date = serializers.DateField(required=False, default=timezone.localdate)
    hours_to_earn = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    emotional_state_display = serializers.CharField(source='get_emotional_state_display', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'amount',
            'date',
            'category',
            'category_display',
            'emotional_state',
            'emotional_state_display',
            'description',
            'hours_to_earn',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'hours_to_earn', 'category_display', 'emotional_state_display']

    def get_hours_to_earn(self, obj):
        # calculate life-hours from amount and hourly rate
        profile = self.context.get('user_profile')
        hourly_wage = profile.net_hourly_wage if profile else None
        return obj.calculate_hours_worked(hourly_wage)


class SubscriptionRatingSerializer(serializers.ModelSerializer):
    # monthly rating entry (YYYY-MM)
    class Meta:
        model = SubscriptionRating
        fields = ['id', 'subscription', 'rating_month', 'value_score', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rating_month(self, value):
        parts = value.split('-')
        if len(parts) != 2 or len(parts[0]) != 4 or len(parts[1]) != 2:
            raise serializers.ValidationError("Format must be YYYY-MM.")
        try:
            month = int(parts[1])
            if month < 1 or month > 12:
                raise ValueError()
        except ValueError:
            raise serializers.ValidationError("Invalid month.")
        return value


class SubscriptionSerializer(serializers.ModelSerializer):
    # subscription serializer with computed cancellation flag
    start_date = serializers.DateField(required=False, default=timezone.localdate)
    ratings = SubscriptionRatingSerializer(many=True, read_only=True)
    hours_to_earn = serializers.SerializerMethodField()
    consecutive_low_count = serializers.SerializerMethodField()
    should_cancel = serializers.SerializerMethodField()
    latest_score = serializers.SerializerMethodField()
    latest_month = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'name',
            'amount',
            'billing_cycle',
            'category',
            'category_display',
            'start_date',
            'is_active',
            'created_at',
            'hours_to_earn',
            'consecutive_low_count',
            'should_cancel',
            'latest_score',
            'latest_month',
            'ratings',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'hours_to_earn',
            'consecutive_low_count',
            'should_cancel',
            'latest_score',
            'latest_month',
            'ratings',
            'category_display',
        ]

    def get_hours_to_earn(self, obj):
        profile = self.context.get('user_profile')
        hourly_wage = profile.net_hourly_wage if profile else UserProfile.get_settings().net_hourly_wage
        if hourly_wage and hourly_wage > 0:
            return round(float(obj.amount) / float(hourly_wage), 2)
        return 0.0

    def get_consecutive_low_count(self, obj):
        return obj.get_rating_status()['consecutive_low_count']

    def get_should_cancel(self, obj):
        return obj.get_rating_status()['should_cancel']

    def get_latest_score(self, obj):
        return obj.get_rating_status()['latest_score']

    def get_latest_month(self, obj):
        return obj.get_rating_status()['latest_month']
