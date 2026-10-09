import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClubCard } from "@/components/cards";
import { SearchBar } from "@/components/SearchBar";
import { Chip, EmptyState, ErrorState, Loading } from "@/components/ui";
import { clubsApi } from "@/lib/api";
import { colors, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports", "Literary", "Social", "Professional", "Media", "Wellness"];

export default function Clubs() {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => clubsApi.list(), [], { refetchOnFocus: false });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).filter(
      (c) =>
        (category === "All" || c.category === category) &&
        (!needle || [c.name, c.short_name, c.department, c.faculty].some((s) => s?.toLowerCase().includes(needle))),
    );
  }, [data, category, q]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
        <Text style={type.display}>Clubs</Text>
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or department" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {loading ? (
        <Loading label="Loading clubs…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ClubCard club={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          keyboardDismissMode="on-drag"
          ListHeaderComponent={data ? <Text style={[type.small, { marginBottom: 4 }]}>{filtered.length} clubs</Text> : null}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No clubs match" body="Try another category or search term." />}
        />
      )}
    </SafeAreaView>
  );
}
