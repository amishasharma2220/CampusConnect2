import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventCard } from "@/components/cards";
import { SearchBar } from "@/components/SearchBar";
import { Chip, EmptyState, ErrorState, Loading } from "@/components/ui";
import { eventsApi } from "@/lib/api";
import { sortEvents } from "@/lib/format";
import { colors, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

const CATEGORIES = ["All types", "Tech", "Cultural", "Sports", "Academic"];
const WHEN = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past" },
  { key: "all", label: "Any time" },
] as const;

export default function Events() {
  const [category, setCategory] = useState("All types");
  const [when, setWhen] = useState<(typeof WHEN)[number]["key"]>("upcoming");
  const [q, setQ] = useState("");
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => eventsApi.list().then(sortEvents));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        (category === "All types" || e.category === category) &&
        (when === "all" || e.status === when) &&
        (!needle || [e.title, e.venue, e.organizer_club, e.tagline].some((s) => s?.toLowerCase().includes(needle))),
    );
  }, [data, category, when, q]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
        <Text style={type.display}>Events</Text>
        <SearchBar value={q} onChange={setQ} placeholder="Search events, venues, clubs" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
        {WHEN.map((w) => (
          <Chip key={w.key} label={w.label} active={when === w.key} onPress={() => setWhen(w.key)} />
        ))}
        <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 4 }} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {loading ? (
        <Loading label="Loading events…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <EmptyState
              icon="calendar-clear-outline"
              title="No events match"
              body={q ? `Nothing found for "${q}".` : "Try a different category or time filter."}
              action="Clear filters"
              onAction={() => {
                setQ("");
                setCategory("All types");
                setWhen("all");
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
