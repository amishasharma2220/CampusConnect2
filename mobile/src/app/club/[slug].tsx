import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Banner, Button, Card, CategoryTag, ErrorState, InfoRow, Loading, StatusTag } from "@/components/ui";
import { clubsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { initials, rupees } from "@/lib/format";
import { catColor, colors, radius, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

export default function ClubDetails() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const club = useQuery(() => clubsApi.get(slug), [slug], { refetchOnFocus: false });
  const members = useQuery(() => clubsApi.members(slug), [slug]);
  const events = useQuery(() => clubsApi.events(slug), [slug], { refetchOnFocus: false });

  if (club.loading) return <Loading />;
  if (club.error || !club.data) return <ErrorState message={club.error ?? "Club not found."} onRetry={club.reload} />;

  const c = club.data;
  const tint = catColor(c.category);
  const isMember = !!user && (members.data ?? []).some((m) => m.user_id === user.id);
  const leaders = (members.data ?? []).filter((m) => m.role !== "Member").slice(0, 8);
  const upcoming = (events.data ?? []).filter((e) => e.status === "upcoming");
  const past = (events.data ?? []).filter((e) => e.status !== "upcoming").slice(0, 5);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 150, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={club.refreshing}
            onRefresh={() => {
              club.refresh();
              members.refresh();
              events.refresh();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.hero, { backgroundColor: tint.bg }]}>
          <View style={[styles.logo, { backgroundColor: tint.fg }]}>
            <Text style={styles.logoText}>{c.short_name?.slice(0, 4) || initials(c.name)}</Text>
          </View>
          <Text style={[type.display, { fontSize: 24, marginTop: 14 }]}>{c.name}</Text>
          <Text style={[type.small, { marginTop: 4 }]}>
            {c.department} · {c.faculty}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" }}>
            <CategoryTag category={c.category} />
            {isMember ? <StatusTag label="Member" tone="success" /> : null}
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={String(c.members_count)} label="Members" />
          <Stat value={c.founded_year ? String(c.founded_year) : "—"} label="Founded" />
          <Stat value={c.fee ? rupees(c.fee) : "Free"} label="Fee" />
        </View>

        {c.long_description || c.description ? (
          <View style={{ gap: 8 }}>
            <Text style={type.label}>About</Text>
            <Text style={type.body}>{c.long_description || c.description}</Text>
          </View>
        ) : null}

        <View>
          <InfoRow icon="school-outline" label="Faculty advisor" value={c.faculty_advisor} />
          <InfoRow icon="mail-outline" label="Contact" value={c.email || c.faculty_email} />
        </View>

        {c.instagram_url || c.linkedin_url ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {c.instagram_url ? <Button title="Instagram" icon="logo-instagram" variant="secondary" style={{ flex: 1 }} onPress={() => WebBrowser.openBrowserAsync(c.instagram_url!)} /> : null}
            {c.linkedin_url ? <Button title="LinkedIn" icon="logo-linkedin" variant="secondary" style={{ flex: 1 }} onPress={() => WebBrowser.openBrowserAsync(c.linkedin_url!)} /> : null}
          </View>
        ) : null}

        {leaders.length ? (
          <View style={{ gap: 10 }}>
            <Text style={type.label}>Leadership</Text>
            <Card style={{ paddingVertical: 4 }}>
              {leaders.map((m, i) => (
                <View key={m.id} style={[styles.member, i < leaders.length - 1 && styles.divider]}>
                  <Avatar label={initials(m.full_name)} size={36} tint={colors.navy} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.body, { fontWeight: "600" }]}>{m.full_name || "Member"}</Text>
                    <Text style={type.small}>{m.role}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {upcoming.length || past.length ? (
          <View style={{ gap: 10 }}>
            <Text style={type.label}>Events</Text>
            <Card style={{ paddingVertical: 4 }}>
              {[...upcoming, ...past].map((e, i, all) => (
                <Pressable
                  key={e.id}
                  onPress={() => router.push({ pathname: "/event/[slug]", params: { slug: e.slug } })}
                  style={[styles.member, i < all.length - 1 && styles.divider]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[type.body, { fontWeight: "600" }]} numberOfLines={1}>
                      {e.title}
                    </Text>
                    <Text style={type.small}>
                      {e.display_date || "Date TBA"}
                      {e.venue ? ` · ${e.venue}` : ""}
                    </Text>
                  </View>
                  {e.status === "upcoming" ? <StatusTag label="Upcoming" tone="warning" /> : null}
                  <Ionicons name="chevron-forward" size={16} color={colors.faint} />
                </Pressable>
              ))}
            </Card>
          </View>
        ) : null}

        {!isMember && user?.role === "student" ? (
          <Pressable onPress={() => router.push({ pathname: "/club/request", params: { slug: c.slug, name: c.name } })}>
            <Text style={{ color: colors.primaryDark, fontWeight: "600", textAlign: "center" }}>Part of the core team? Request admin access</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isMember ? (
          <Banner tone="success" text={`You're a member of ${c.short_name || c.name}.`} />
        ) : (
          <Button
            title={c.fee ? `Join for ${rupees(c.fee)}` : "Join club"}
            icon="person-add-outline"
            loading={members.loading}
            onPress={() => router.push({ pathname: "/club/join", params: { slug: c.slug } })}
          />
        )}
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[type.heading, { fontSize: 18 }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 20 },
  logo: { width: 60, height: 60, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, gap: 2 },
  member: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
