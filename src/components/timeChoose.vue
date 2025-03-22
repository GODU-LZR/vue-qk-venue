<template>
  <div class="time-grid">
    <el-tooltip
        v-for="(slot, index) in timeSlots"
        :key="index"
        :content="`${slot.start} - ${slot.end}`"
        placement="top"
    >
      <div
          class="time-slot"
          :class="{ disabled: isDisabled(slot), selected: isSelected(slot) }"
          @click="handleSlotClick(slot)"
      >
        <!-- 格子内容 -->
      </div>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    disabledRanges: {
      type: Array,
      default: () => [],
    },
    dateDay: ''
  },
  data() {
    return {
      selectedSlots: [],
    };
  },
  computed: {
    timeSlots() {
      const slots = [];
      let currentTime = this.startTime;

      while (currentTime < this.endTime) {
        const start = currentTime;
        const end = this.addMinutes(currentTime, 30); // 增加 30 分钟
        slots.push({ start, end });
        currentTime = end;
      }
      return slots;
    },
  },
  methods: {
    // 增加指定分钟数
    addMinutes(time, minutes) {
      const [hour, minute] = time.split(":").map(Number);
      const totalMinutes = hour * 60 + minute + minutes;
      const newHour = Math.floor(totalMinutes / 60) % 24;
      const newMinute = totalMinutes % 60;
      return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
    },

    // 检查格子是否被禁用
    isDisabled(slot) {
      if(!this.dateDay){
        return true;
      }
      return this.disabledRanges.some((range) => {
        const [disabledStart, disabledEnd] = range.split("-");
        return (
            (slot.start >= disabledStart && slot.start < disabledEnd) || // 开始时间在禁用范围内
            (slot.end > disabledStart && slot.end <= disabledEnd) // 结束时间在禁用范围内
        );
      });
    },

    // 检查格子是否被选中
    isSelected(slot) {
      return this.selectedSlots.some(
          (selected) => selected.start === slot.start && selected.end === slot.end
      );
    },

    // 处理格子点击事件
    handleSlotClick(slot) {
      if (this.isDisabled(slot)) return;

      // 如果点击的格子已经选中，则取消选中
      if (this.isSelected(slot)) {
        const index = this.selectedSlots.findIndex(
            (selected) => selected.start === slot.start && selected.end === slot.end
        );

        // 如果取消的是中间格子，则移除该格子及其后面的所有格子
        if (index !== -1 && index < this.selectedSlots.length - 1) {
          this.selectedSlots = this.selectedSlots.slice(0, index);
        } else {
          this.selectedSlots = this.selectedSlots.filter(
              (selected) => !(selected.start === slot.start && selected.end === slot.end)
          );
        }

        this.submitSelection(); // 取消选中后，重新计算时间段
        return;
      }

      // 如果选中的格子不连续，则清空已选中的格子
      if (
          this.selectedSlots.length > 0 &&
          !this.isConsecutive(this.selectedSlots[this.selectedSlots.length - 1], slot)
      ) {
        this.selectedSlots = [];
      }

      this.selectedSlots.push(slot);
      this.submitSelection(); // 选中新格子后，重新计算时间段
    },

    // 检查两个格子是否连续
    isConsecutive(prevSlot, nextSlot) {
      return prevSlot.end === nextSlot.start;
    },

    // 提交选中的时间段
    submitSelection() {
      if (this.selectedSlots.length === 0) {
        this.$emit("submit", null); // 如果没有选中任何格子，返回 null
        return;
      }

      const startTime = this.selectedSlots[0].start;
      const endTime = this.selectedSlots[this.selectedSlots.length - 1].end;
      this.$emit("submit", { startTime, endTime });
    },
    clearSelection() {
      this.selectedSlots = [];
    }
  },
};
</script>

<style scoped>
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  width: 100%;
}

.time-slot {
  width: 50px; /* 每行 8 个格子 */
  height: 50px;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 10px; /* 设置圆角 */
  overflow: hidden; /* 确保子元素的圆角不溢出 */
}

.time-slot.disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.time-slot.selected {
  background-color: #a0d8ef;
}
</style>