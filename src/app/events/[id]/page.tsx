"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import EventDetailsPage from '../../../views/EventDetailsPage';
import EventsPage from '../../../views/EventsPage';

export default function DynamicEventPage() {
  const params = useParams();
  const id = params?.id as string;

  // If the parameter is an academic year (e.g., "2026-27", "2025-26", "2024-25")
  const isYearPage = /^20\d{2}-\d{2}$/.test(id || '');

  if (isYearPage) {
    return <EventsPage yearFilter={id} />;
  }

  return <EventDetailsPage />;
}
