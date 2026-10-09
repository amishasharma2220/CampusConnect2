import { router } from "expo-router";
import { SectionList, RefreshControl, Text } from "react-native";

import { EventCard } from "@/components/cards";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { eventsApi } from "@/lib/api";
import { sortEvents } from "@/lib/format";
import { colors, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

export default function MyEvents() {
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() =>
    eventsApi.list().then((list) => sortEvents(list.filter((e) => e.is_registered))),
  );

  if (loading) return <Loading />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const sections = [
    { title: "Upcoming", data: (data ?? []).filter((e) => e.status === "upcoming") },
    { title: "Past", data: (data ?? []).filter((e) => e.status !== "upcoming") },
  ].filter((s) => s.data.length);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EventCard event={item} />}
      renderSectionHeader={({ section }) => <Text style={[type.label, { marginTop: 8, marginBottom: 2, backgroundColor: colors.bg }]}>{section.title}</Text>}
      contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          icon="ticket-outline"
          title="No registrations yet"
          body="Events you register for will show up here."
          action="Browse events"
          onAction={() => router.navigate("/events")}
        />
      }
    />
  );
}
