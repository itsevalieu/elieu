import styles from "../Timeline/Timeline.module.scss";
import AchievementItem from "./AchievementItem";
import { Achievement } from "@evalieu/common";

type GroupedAchievements = Record<string, Record<string, Achievement[]>>;

export default function AchievementTimeline({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const groupedAchievements = achievements.reduce<GroupedAchievements>((acc, achievement) => {
    const year = new Date(achievement.date).getFullYear().toString();
    const month = new Date(achievement.date).toLocaleString("default", {
      month: "long",
    });

    if (!acc[year]) {
      acc[year] = {};
    }

    if (!acc[year][month]) {
      acc[year][month] = [];
    }

    acc[year][month].push(achievement);

    return acc;
  }, {});

  const sortedYears = Object.keys(groupedAchievements).sort((a, b) => Number(b) - Number(a));

  return (
    <div className={styles.timelineContainer}>
      {sortedYears.map((year) => (
        <div key={year} className={styles.yearContainer}>
          <div className={styles.year}>
            <div className={styles.yearLabel}>{year}</div>
            {Object.keys(groupedAchievements[year])
              .sort((a, b) => {
                const dateA = new Date(`${a} 1, ${year}`);
                const dateB = new Date(`${b} 1, ${year}`);
                return dateB.getTime() - dateA.getTime();
              })
              .map((month) => (
                <div key={month} className={styles.monthContainer}>
                  <div className={styles.month}>
                    {month.slice(0, 3).toUpperCase()}
                  </div>
                  <div className={styles.timelineItems}>
                    {groupedAchievements[year][month].map((achievement) => (
                      <AchievementItem
                        key={achievement.id}
                        achievement={achievement}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
