import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../../components/primary-button";
import { CAREERS_BY_ID } from "../../../../content/careers";
import { HOUSES_BY_ID } from "../../../../content/houses";
import type { NoticeTone, Prompt } from "../../../../engine/types";
import { useGameStore } from "../../../../store/game-store";
import { GAME_COLORS } from "../../../../theme";
import { formatMoney } from "../../../../utils/format-money";

const TONE_LABELS: Record<NoticeTone, { label: string; color: string }> = {
  tile: { label: "Pole", color: "#3D8BFF" },
  card: { label: "Karta akcji", color: "#FF8A3D" },
  event: { label: "Wydarzenie", color: "#E0A100" },
  payday: { label: "Wypłata", color: "#2E9E4F" },
  finish: { label: "Meta", color: "#C9A400" },
};

function Header({
  tone,
  emoji,
  title,
  body,
}: {
  tone: NoticeTone;
  emoji: string;
  title: string;
  body: string;
}) {
  const badge = TONE_LABELS[tone];

  return (
    <>
      <View style={[styles.badge, { backgroundColor: badge.color }]}>
        <Text style={styles.badgeText}>{badge.label}</Text>
      </View>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </>
  );
}

function Choice({ title, meta, onPress }: { title: string; meta: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
    >
      <Text style={styles.choiceTitle}>{title}</Text>
      <Text style={styles.choiceMeta}>{meta}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondary}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

/** One prompt from the store's queue: what the modal shows after a pawn stops. */
export function PromptContent({ prompt }: { prompt: Prompt }) {
  const players = useGameStore((state) => state.players);
  const current = useGameStore((state) => state.players[state.currentIndex]);
  const acknowledgePrompt = useGameStore((state) => state.acknowledgePrompt);
  const chooseTarget = useGameStore((state) => state.chooseTarget);
  const chooseCareer = useGameStore((state) => state.chooseCareer);
  const buyHouse = useGameStore((state) => state.buyHouse);

  switch (prompt.kind) {
    case "notice":
      return (
        <>
          <Header tone={prompt.tone} emoji={prompt.emoji} title={prompt.title} body={prompt.body} />
          {prompt.lines.length > 0 && (
            <View style={styles.lines}>
              {prompt.lines.map((line) => (
                <Text key={line} style={styles.line}>
                  {line}
                </Text>
              ))}
            </View>
          )}
          <PrimaryButton label="Dalej" onPress={acknowledgePrompt} />
        </>
      );
    case "choose-target":
      return (
        <>
          <Header tone="card" emoji={prompt.emoji} title={prompt.title} body={prompt.body} />
          <View style={styles.choices}>
            {prompt.targets.map((index) => (
              <Choice
                key={players[index].id}
                title={players[index].name}
                meta={`Konto: ${formatMoney(players[index].money)}`}
                onPress={() => chooseTarget(index)}
              />
            ))}
          </View>
        </>
      );
    case "career":
      return (
        <>
          <Header
            tone="tile"
            emoji="💼"
            title="Wybierz zawód"
            body={
              current.hasDegree
                ? "Z dyplomem masz dostęp do lepszych posad."
                : "Bez dyplomu wybór jest skromniejszy."
            }
          />
          <View style={styles.choices}>
            {prompt.options.map((careerId) => {
              const career = CAREERS_BY_ID[careerId];

              return (
                <Choice
                  key={careerId}
                  title={`${career.emoji} ${career.name}`}
                  meta={`Pensja: ${formatMoney(career.salary)}`}
                  onPress={() => chooseCareer(careerId)}
                />
              );
            })}
          </View>
          {prompt.canKeep && current.careerId && (
            <SecondaryButton
              label={`Zostaję: ${CAREERS_BY_ID[current.careerId].name}`}
              onPress={() => chooseCareer(null)}
            />
          )}
        </>
      );
    case "house":
      return (
        <>
          <Header
            tone="tile"
            emoji="🔑"
            title="Kupno domu"
            body={`Na koncie: ${formatMoney(current.money)}. Brakujące pieniądze to kredyt.`}
          />
          <View style={styles.choices}>
            {prompt.options.map((houseId) => {
              const house = HOUSES_BY_ID[houseId];

              return (
                <Choice
                  key={houseId}
                  title={`${house.emoji} ${house.name}`}
                  meta={`Cena ${formatMoney(house.price)} · na koniec ${formatMoney(house.value)}`}
                  onPress={() => buyHouse(houseId)}
                />
              );
            })}
          </View>
          <SecondaryButton
            label={current.houseId ? "Zostaję w obecnym domu" : "Nie kupuję"}
            onPress={() => buyHouse(null)}
          />
        </>
      );
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emoji: {
    fontSize: 48,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    color: GAME_COLORS.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    color: GAME_COLORS.textSecondary,
  },
  lines: {
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: GAME_COLORS.background,
  },
  line: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    color: GAME_COLORS.textPrimary,
  },
  choices: {
    gap: 10,
  },
  choice: {
    gap: 4,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GAME_COLORS.surfaceBorder,
  },
  choicePressed: {
    borderColor: GAME_COLORS.accent,
    backgroundColor: "#FDECEE",
  },
  choiceTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: GAME_COLORS.textPrimary,
  },
  choiceMeta: {
    fontSize: 14,
    color: GAME_COLORS.textMuted,
  },
  secondary: {
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: GAME_COLORS.accent,
  },
});
