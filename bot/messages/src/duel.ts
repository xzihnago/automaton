import type { ChatCommand } from "./types.js";
import { inlineCode, userMention } from "discord.js";

export const duel: ChatCommand<true> = {
  pattern: /duel|決鬥/,
  name: "duel",
  callback: async (message) => {
    const targets = message.mentions.members;

    const messages = [];
    for (const [id] of targets) {
      switch (id) {
        case message.client.application.owner?.id:
          messages.push(
            `${userMention(message.author.id)} 的攻擊被神秘力量抹消了`,
          );
          break;

        case message.client.user.id:
          messages.push(
            `${userMention(message.client.user.id)} 對 ${userMention(message.author.id)} 使用了 ${inlineCode("不可以壞壞")}`,
          );
          break;

        default: {
          messages.push(getDuelMessage(message.author.id, id));
          break;
        }
      }
    }

    await message.channel.send(messages.join("\n"));
  },
};

const getDuelMessage = (source: string, target: string) => {
  const skills = {
    normal: {
      水球: 10,
      水柱: 15,
      水槍: 20,

      火球: 10,
      火焰: 15,
      火箭: 20,

      風刃: 10,
      風暴: 15,
      颶風: 20,

      落石: 10,
      地裂: 15,
      地震: 20,

      雷擊: 20,

      聖光: 20,

      黑暗: 20,
    },

    special: [
      (source: string, target: string) =>
        `${userMention(source)} 發動了 ${inlineCode("爆裂魔法")}，${userMention(target)} 被燒成了灰燼`,
      (source: string, target: string) =>
        `${userMention(source)} 使用了 ${inlineCode("液壓機")}，${userMention(target)} 成功進入二次元`,
    ],
  };

  if (Math.random() < 0.1) {
    return skills.special[Math.floor(Math.random() * skills.special.length)](
      source,
      target,
    );
  } else {
    const normalSkills = Object.entries(skills.normal);
    const skill = normalSkills[Math.floor(Math.random() * normalSkills.length)];
    return `${userMention(source)} 對 ${userMention(target)} 使用了 ${inlineCode(skill[0])}，造成了 ${inlineCode(skill[1].toFixed())} 點傷害`;
  }
};
