# tracker api url routes
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SettingsView, ExpenseViewSet, SubscriptionViewSet, DashboardSummaryView

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('settings/', SettingsView.as_view(), name='user-settings'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('', include(router.urls)),
]
