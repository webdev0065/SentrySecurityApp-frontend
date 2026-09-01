import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import AgencyBottomNavigation from '../components/AgencyBottomNavigation';
import AgencyProfileMenu from '../components/AgencyProfileMenu';
import AgencyTopNavigation from '../components/AgencyTopNavigation';

const summary = [
  ['users', '4', 'Guards on duty', '#0EAE5A', '#E2F5E9'],
  ['grid', '3', 'Active sites', '#F5A400', '#FFF1D9'],
  ['alert-circle', '1', 'Open incidents', '#EF4444', '#FDE4E4'],
  ['user', '2', 'Unassigned guards', '#2563EB', '#E8EEFF'],
] as const;
const sites = [
  'Cyber Hub — Gate 2',
  'Cyber Hub — Reception',
  'Sunrise Mall — Lobby',
  'Vista Towers — Roof Access',
];

const Icon = ({
  name,
  color,
  size = 23,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  size?: number;
}) => <Feather name={name} size={f(size)} color={color} />;
const Chevron = () => <Icon name="chevron-right" color="#696969" />;

const AgencyOverviewScreen: React.FC = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  return (
  // edges: top keeps the header clear of the notch/status bar; bottom keeps
  // the tab bar clear of the home indicator on notched devices.
  <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

    <AgencyTopNavigation profileMenuOpen={profileMenuOpen} onProfilePress={() => setProfileMenuOpen(open => !open)} />

    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.titleRow}>
        <Text style={s.section}>QUICK SUMMARY</Text>
        <View style={s.date}>
          <Text style={s.dateText}>Today, 24 May 2026</Text>
          <Icon name="calendar" color="#666" size={24} />
        </View>
      </View>

      <View style={s.grid}>
        {summary.map(([icon, value, label, color, tint]) => (
          <TouchableOpacity key={label} style={s.card}>
            <View style={[s.cardIcon, { backgroundColor: tint }]}>
              <Icon name={icon} color={color} size={27} />
            </View>
            <View style={s.cardCopy}>
              <Text style={[s.number, { color }]}>{value}</Text>
              <Text style={s.cardLabel}>{label}</Text>
              <Text style={s.details}>View details ›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.insights}>
        <Insight
          icon="credit-card"
          title="PAYROLL SUMMARY"
          value="₹1,52,300"
          caption="April 2026 • 0 pending"
          color="#33C977"
          tint="#E2F5E9"
        />
        <Insight
          icon="file-text"
          title="INVOICES"
          value="₹45,000"
          caption="1 pending • 2 invoices"
          color="#5A8DFF"
          tint="#EEF3FF"
        />
        <Insight
          icon="star"
          title="CLIENT REVIEWS"
          value="★★★★★ 5.0 (1)"
          caption="Sunrise Mall"
          color="#A57AFF"
          tint="#F2EDFF"
          stars
        />
      </View>

      <Text style={s.section}>QUICK ACTIONS</Text>
      <View style={s.actions}>
        <Action icon="user-plus" text="+ Guard" color="#0EAA55" />
        <Action icon="grid" text="+ Site" color="#F39A00" />
        <Action icon="alert-triangle" text="Incident" color="#F22121" />
      </View>

      <View style={s.liveHeader}>
        <Text style={s.section}>LIVE STATUS</Text>
        <TouchableOpacity style={s.viewAll}>
          <Text style={s.viewAllText}>View All</Text>
          <Icon name="chevron-right" color="#2563EB" size={20} />
        </TouchableOpacity>
      </View>

      <View style={s.list}>
        {sites.map(site => (
          <Live key={site} title={site} assigned />
        ))}
        <Live title="Unassigned" assigned={false} />
      </View>
    </ScrollView>

    <AgencyBottomNavigation activeTab="overview" />
    {profileMenuOpen ? <Pressable style={s.menuBackdrop} onPress={() => setProfileMenuOpen(false)} /> : null}
    {profileMenuOpen ? <AgencyProfileMenu onLogout={() => setProfileMenuOpen(false)} /> : null}
  </SafeAreaView>
  );
};

const Insight = ({
  icon,
  title,
  value,
  caption,
  color,
  tint,
  stars,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  value: string;
  caption: string;
  color: string;
  tint: string;
  stars?: boolean;
}) => (
  <TouchableOpacity style={s.insight}>
    <View style={[s.insightIcon, { backgroundColor: tint }]}>
      <Icon name={icon} color={color} />
    </View>
    <View style={s.insightCopy}>
      <Text style={s.insightTitle}>{title}</Text>
      <Text style={[s.insightValue, stars && s.stars]}>{value}</Text>
      <Text style={s.caption}>{caption}</Text>
    </View>
    <Chevron />
  </TouchableOpacity>
);
const Action = ({
  icon,
  text,
  color,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  text: string;
  color: string;
}) => (
  <TouchableOpacity style={[s.action, { borderColor: color }]}>
    <Icon name={icon} color={color} size={20} />
    <Text style={[s.actionText, { color }]}>{text}</Text>
  </TouchableOpacity>
);
const Live = ({ title, assigned }: { title: string; assigned: boolean }) => (
  <TouchableOpacity style={s.live}>
    <View
      style={[
        s.liveIcon,
        { backgroundColor: assigned ? '#E2F5E9' : '#FDE4E4' },
      ]}
    >
      <Icon
        name={assigned ? 'grid' : 'user'}
        color={assigned ? '#16A34A' : '#F26E6E'}
        size={22}
      />
    </View>
    <View style={s.liveCopy}>
      <Text style={s.liveTitle}>{title}</Text>
      <Text
        style={[s.liveCaption, { color: assigned ? '#16A34A' : '#EF4444' }]}
      >
        {assigned ? '1/1 on duty' : '0/2 on duty'}
      </Text>
    </View>
    <Chevron />
  </TouchableOpacity>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  menuBackdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
  header: {
    height: h(64),
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(14),
    backgroundColor: colors.white,
    zIndex: 30,
    elevation: 0,
  },
  logo: { width: w(180), height: h(180)},
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: w(10) },
  profileTrigger: { flexDirection: 'row', alignItems: 'center', gap: w(10) },
  bellWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    right: -w(5),
    top: -h(5),
    width: w(13),
    height: w(13),
    borderRadius: w(7),
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: f(8), fontWeight: '700' },
  avatarWrapper: { position: 'relative', marginRight: w(11) },
  avatar: {
    width: w(33),
    height: w(33),
    borderRadius: w(17),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: f(13) },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: w(10),
    height: w(10),
    borderRadius: w(5),
    backgroundColor: '#19B563',
    borderWidth: 1,
    borderColor: colors.white,
  },
  scroll: { flex: 1 },
  content: { padding: w(11), paddingBottom: h(14) },
  titleRow: {
    height: h(54),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { color: colors.primary, fontWeight: '700', fontSize: f(17) },
  date: { flexDirection: 'row', alignItems: 'center', gap: w(6) },
  dateText: { color: '#747474', fontSize: f(16) },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: w(16),
  },
  card: {
    width: w(181),
    height: h(100),
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    padding: w(12),
    flexDirection: 'row',
  },
  cardIcon: {
    width: w(50),
    height: w(50),
    borderRadius: w(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { marginLeft: w(12), flex: 1 },
  number: { fontSize: f(31), lineHeight: f(32), fontWeight: '500' },
  cardLabel: { color: colors.primary, fontSize: f(13), fontWeight: '500' },
  details: { color: '#707070', fontSize: f(10), marginTop: h(4) },
  insights: { gap: h(15), marginTop: h(27), marginBottom: h(23) },
  insight: {
    height: h(71),
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    paddingHorizontal: w(11),
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: w(42),
    height: w(42),
    borderRadius: w(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: { flex: 1, marginLeft: w(13) },
  insightTitle: { fontSize: f(12), color: '#6C6C6C', fontWeight: '500' },
  insightValue: { fontSize: f(17), color: colors.primary, fontWeight: '700' },
  stars: { color: '#FFB800', fontSize: f(16) },
  caption: { fontSize: f(10), color: '#686868' },
  actions: {
    flexDirection: 'row',
    gap: w(8),
    marginTop: h(12),
    marginBottom: h(27),
  },
  action: {
    height: h(36),
    borderRadius: w(7),
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w(6),
  },
  actionText: { fontWeight: '700', fontSize: f(15) },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h(12),
  },
  viewAll: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { color: '#2563EB', fontWeight: '600', fontSize: f(14) },
  list: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    overflow: 'hidden',
  },
  live: {
    height: h(65),
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: w(11),
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIcon: {
    width: w(40),
    height: w(40),
    borderRadius: w(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCopy: { flex: 1, marginLeft: w(13) },
  liveTitle: { fontSize: f(16), fontWeight: '700', color: colors.primary },
  liveCaption: { fontSize: f(10), marginTop: 2 },
});

export default AgencyOverviewScreen;
