import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card, StatusTag, type IconName } from "@/components/ui";
import { clubAdminRequestsApi, WEB_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { initials, shortDate } from "@/lib/format";
import { colors, radius, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

const ROLE_LABEL = { student: "Student", club_admin: "Club admin", university_admin: "University admin" } as const;

export default function Profile() {
  const { user, signOut, refreshUser } = useAuth();
  const requests = useQuery(() => clubAdminRequestsApi.mine());

  if (!user) return null;

  const confirmSignOut = () => {
    if (Platform.OS === "web") {
      signOut();
      return;
    }
    Alert.alert("Sign out?", "You'll need to sign in again to register for events.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const details = [
    ["Registration no.", user.registration_number],
    ["Branch", user.branch],
    ["Year", user.year_of_study],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={requests.refreshing}
            onRefresh={() => {
              refreshUser().catch(() => {});
              requests.refresh();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={type.display}>Profile</Text>

        <Card style={{ alignItems: "center", paddingVertical: 24, gap: 6 }}>
          <Avatar label={initials(user.full_name)} size={72} />
          <Text style={[type.title, { marginTop: 8 }]}>{user.full_name || "Student"}</Text>
          <Text style={type.small}>{user.email}</Text>
          <View style={{ marginTop: 6 }}>
            <StatusTag label={ROLE_LABEL[user.role] ?? user.role} tone={user.role === "student" ? "neutral" : "success"} />
          </View>
          {details.length ? (
            <View style={styles.details}>
              {details.map(([k, v]) => (
                <View key={k} style={{ alignItems: "center", flex: 1 }}>
                  <Text style={[type.heading, { fontSize: 15 }]} numberOfLines={1}>
                    {v}
                  </Text>
                  <Text style={type.small}>{k}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <View style={styles.menu}>
          <MenuItem icon="ticket-outline" label="My events" onPress={() => router.push("/my-events")} />
          {user.role === "club_admin" ? <MenuItem icon="stats-chart-outline" label="Club dashboard" onPress={() => router.push("/club-dashboard")} /> : null}
          {WEB_URL ? (
            <MenuItem
              icon="globe-outline"
              label={user.role === "student" ? "Open CampusConnect on the web" : "Manage events on the web"}
              onPress={() => WebBrowser.openBrowserAsync(WEB_URL)}
              external
            />
          ) : null}
        </View>

        {requests.data && requests.data.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={type.label}>Club admin requests</Text>
            {requests.data.map((r) => (
              <Card key={r.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Text style={[type.heading, { flex: 1 }]} numberOfLines={1}>
                    {r.club_name}
                  </Text>
                  <StatusTag label={r.status[0].toUpperCase() + r.status.slice(1)} tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"} />
                </View>
                <Text style={type.small}>
                  {r.position} · requested {shortDate(r.created_at)}
                </Text>
                {r.admin_notes ? <Text style={[type.body, { fontSize: 14 }]}>“{r.admin_notes}”</Text> : null}
              </Card>
            ))}
          </View>
        ) : null}

        <Pressable onPress={confirmSignOut} style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.8 }]}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: "700", fontSize: 16 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress, external }: { icon: IconName; label: string; onPress: () => void; external?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.bg }]}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={20} color={colors.primaryDark} />
      </View>
      <Text style={[type.body, { flex: 1, fontWeight: "600" }]}>{label}</Text>
      <Ionicons name={external ? "open-outline" : "chevron-forward"} size={18} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  details: { flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, alignSelf: "stretch" },
  menu: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  signOut: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", padding: 16, borderRadius: radius.lg, backgroundColor: colors.dangerSoft },
});
