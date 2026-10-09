import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Club, Event } from "@/lib/api";
import { dateTile, eventDateLabel, initials, rupees, seatsLeft } from "@/lib/format";
import { catColor, colors, radius, type } from "@/lib/theme";

import { CategoryTag, StatusTag } from "./ui";

export function EventCard({ event }: { event: Event }) {
  const tile = dateTile(event);
  const c = catColor(event.category);
  const left = seatsLeft(event);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${eventDateLabel(event)}`}
      onPress={() => router.push({ pathname: "/event/[slug]", params: { slug: event.slug } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.tile, { backgroundColor: c.bg }]}>
        <Text style={[styles.tileDay, { color: c.fg }]}>{tile.day}</Text>
        <Text style={[styles.tileMonth, { color: c.fg }]}>{tile.month}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          <CategoryTag category={event.category} />
          {event.is_registered ? <StatusTag label="Registered" tone="success" /> : null}
          {event.status === "completed" ? <StatusTag label="Completed" tone="neutral" /> : null}
          {event.status === "cancelled" ? <StatusTag label="Cancelled" tone="danger" /> : null}
        </View>
        <Text style={type.heading} numberOfLines={2}>
          {event.title}
        </Text>
        {event.venue ? (
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={type.small} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="people-outline" size={14} color={colors.muted} />
          <Text style={type.small}>
            {event.status === "upcoming" && left !== null ? (left === 0 ? "Full" : `${left} seats left`) : `${event.registration_count ?? 0} registered`}
            {event.is_paid && event.ticket_price ? ` · ${rupees(event.ticket_price)}` : " · Free"}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} style={{ alignSelf: "center" }} />
    </Pressable>
  );
}

export function ClubCard({ club }: { club: Club }) {
  const c = catColor(club.category);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={club.name}
      onPress={() => router.push({ pathname: "/club/[slug]", params: { slug: club.slug } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.logo, { backgroundColor: c.bg }]}>
        <Text style={[styles.logoText, { color: c.fg }]}>{club.short_name?.slice(0, 4) || initials(club.name)}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={type.heading} numberOfLines={2}>
          {club.name}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {club.department}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <CategoryTag category={club.category} />
          <Text style={type.small}>{club.members_count} members</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} style={{ alignSelf: "center" }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  tile: { width: 58, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  tileDay: { fontSize: 22, fontWeight: "800" },
  tileMonth: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  logo: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 14, fontWeight: "800" },
});
