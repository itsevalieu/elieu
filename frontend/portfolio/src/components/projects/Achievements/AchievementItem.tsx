import styles from "./Achievement.module.scss";
import { Achievement } from "@evalieu/common";

export default function AchievementItem({
  achievement,
}: {
  achievement: Achievement;
}) {
  return (
    <div className={styles.achievementItem}>
      <div className={styles.date}>{achievement.date}</div>
      <div className={styles.content}>
        <p>
          <strong>{achievement.title}</strong> - {achievement.context}
        </p>
      </div>
    </div>
  );
}
