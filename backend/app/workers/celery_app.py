"""Celery application configuration."""

from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "nexus_ai",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.tasks.run_simulation_task": {"queue": "simulations"},
        "app.workers.tasks.cleanup_old_simulations": {"queue": "maintenance"},
    },
    beat_schedule={
        "cleanup-old-simulations": {
            "task": "app.workers.tasks.cleanup_old_simulations",
            "schedule": 86400.0,  # daily
        },
    },
)
