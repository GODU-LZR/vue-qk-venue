<template>
  <div class="time-grid">
    <el-tooltip
        v-for="(slot, index) in timeSlots"
        :key="index"
        :content="`${slot.start} - ${slot.end}`"
        placement="top">
      <div
          class="time-slot"
          :class="{ disabled: isDisabled(slot), selected: isSelected(slot) }"
          @click="handleSlotClick(slot)">
        <!-- 格子内容 -->
      </div>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    value: { // v-model 默认绑定到这个 prop
      type: Object, // 允许对象或 null
      default: null,
    },
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
    canCheck: {
      type: Boolean,
      default: false
    }
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

      const endLimit = this.endTime;

      const isTimeBefore = (time1, time2) => {
        return time1 < time2;
      };

      const isTimeEqual = (time1, time2) => {
        return time1 === time2;
      };

      if (!isTimeBefore(currentTime, endLimit)) {
        console.warn("startTime must be before endTime.");
        return [];
      }

      while (isTimeBefore(currentTime, endLimit)) {
        const start = currentTime;
        const end = this.addMinutes(currentTime, 30);

        if (isTimeBefore(end, endLimit) || isTimeEqual(end, endLimit)) {
          slots.push({ start, end });
        } else {
          break;
        }

        currentTime = end;
      }
      return slots;
    },
  },
  watch: {
    value: {
      handler(newValue) {
        // 避免在组件内部修改 selectedSlots 导致 watch 触发，形成死循环
        // 检查 newValue 是否与当前 selectedSlots 对应的范围一致
        const currentSelectedRange = this.selectedSlots.length > 0
            ? { startTime: this.selectedSlots[0].start, endTime: this.selectedSlots[this.selectedSlots.length - 1].end }
            : null;

        // 简单的对象比较，判断逻辑上是否相同
        const isSameRange = (r1, r2) => {
          if (r1 === r2) return true; // handles null === null
          if (!r1 || !r2) return false; // handles null vs object
          return r1.startTime === r2.startTime && r1.endTime === r2.endTime;
        };

        if (isSameRange(newValue, currentSelectedRange)) {
          // 如果父组件传来的值与当前内部状态一致，则不做处理
          return;
        }

        // 如果父组件传来的值不同，则更新内部状态
        if (newValue === null) {
          this.selectedSlots = [];
        } else if (newValue && typeof newValue.startTime === 'string' && typeof newValue.endTime === 'string') {
          const rangeStart = newValue.startTime;
          const rangeEnd = newValue.endTime;

          // 根据传入的范围 [rangeStart, rangeEnd) 找到对应的连续格子
          const newSelected = [];
          let currentCheckTime = rangeStart;

          // 从 timeSlots 中找到第一个匹配 rangeStart 的格子索引
          const startIndex = this.timeSlots.findIndex(slot => slot.start === rangeStart);

          if (startIndex !== -1) {
            let consecutiveMatch = true;
            for (let i = startIndex; i < this.timeSlots.length; i++) {
              const slot = this.timeSlots[i];
              // 检查当前格子是否是期望的下一个连续格子
              if (slot.start === currentCheckTime) {
                newSelected.push(slot);
                currentCheckTime = slot.end; // 更新期望的下一个开始时间
                if (currentCheckTime === rangeEnd) {
                  // 找到了整个范围对应的格子序列
                  break;
                }
              } else {
                // 发现不连续或超出了范围
                consecutiveMatch = false;
                break;
              }
            }

            // 最终检查：找到的序列是否确实以 rangeEnd 结束，并且是连续的
            if (consecutiveMatch && newSelected.length > 0 && newSelected[newSelected.length - 1].end === rangeEnd) {
              this.selectedSlots = newSelected;
            } else {
              // 如果传入的 v-model 值无法精确匹配到连续的格子序列，则清空内部选择
              // 这避免了内部状态与 v-model 值不一致的情况
              this.selectedSlots = [];
            }

          } else {
            // 如果传入的 startTime 无法匹配任何格子的开始时间，则清空内部选择
            this.selectedSlots = [];
          }

        } else {
          // 传入的 value 格式不正确，清空内部选择
          this.selectedSlots = [];
        }
      },
      immediate: true,
    }
  },
  methods: {
    addMinutes(time, minutes) {
      const [hour, minute] = time.split(":").map(Number);
      const totalMinutes = hour * 60 + minute + minutes;
      const newHour = Math.floor(totalMinutes / 60) % 24;
      const newMinute = totalMinutes % 60;
      return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
    },

    isDisabled(slot) {
      if (!this.canCheck) {
        return true;
      }
      return this.disabledRanges.some((range, rangeIndex) => {
        if (!range || typeof range.startTime !== 'string' || typeof range.endTime !== 'string') {
          console.warn(`Invalid disabled range format at index ${rangeIndex}:`, range);
          return false;
        }
        const disabledStart = range.startTime;
        const disabledEnd = range.endTime;
        return slot.start < disabledEnd && disabledStart < slot.end;
      });
    },

    isSelected(slot) {
      return this.selectedSlots.some(
          (selected) => selected.start === slot.start && selected.end === slot.end
      );
    },

    handleSlotClick(slot) {
      if (this.isDisabled(slot)) {
        return;
      }

      if (this.isSelected(slot)) {
        const index = this.selectedSlots.findIndex(
            (selected) => selected.start === slot.start && selected.end === slot.end
        );

        if (index !== -1 && index < this.selectedSlots.length - 1) {
          this.selectedSlots.splice(index);
        } else if (index !== -1) {
          this.selectedSlots = this.selectedSlots.filter(
              (selected) => !(selected.start === slot.start && selected.end === slot.end)
          );
        }
        this.emitInput(); // 修改后发射 input 事件
        return;
      }

      if (
          this.selectedSlots.length > 0 &&
          !this.isConsecutive(this.selectedSlots[this.selectedSlots.length - 1], slot)
      ) {
        this.selectedSlots = [];
      }

      if (this.selectedSlots.length === 0 || this.isConsecutive(this.selectedSlots[this.selectedSlots.length - 1], slot)) {
        this.selectedSlots.push(slot);
      } else {
        console.warn("Clicked slot is not consecutive and selectedSlots was not empty. This might indicate a logic issue or non-consecutive selection is not supported.");
      }

      this.emitInput(); // 修改后发射 input 事件
    },

    isConsecutive(prevSlot, nextSlot) {
      return prevSlot.end === nextSlot.start;
    },

    // === 新增一个方法来发射 input 事件，使其命名更清晰 ===
    emitInput() {
      if (this.selectedSlots.length === 0) {
        // 发射 null 表示没有选中时间段
        this.$emit("input", null); // v-model 默认监听这个事件
      } else {
        // 确保 selectedSlots 是按时间顺序排列的（点击逻辑已保证）
        const startTime = this.selectedSlots[0].start;
        const endTime = this.selectedSlots[this.selectedSlots.length - 1].end;
        // 发射选中的时间段对象
        this.$emit("input", { startTime, endTime }); // v-model 默认监听这个事件
      }
    },

    clearSelection() {
      this.selectedSlots = [];
      this.emitInput(); // 清空后也触发 input 事件，发射 null
    }
  },
};
</script>

<style scoped>
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 格子之间的间隙 */
  width: 100%; /* 容器宽度 */
}

.time-slot {
  /* 基础样式，不使用复杂的计算 */
  width: 50px; /* 示例宽度，请根据您的设计调整 */
  height: 50px; /* 示例高度，请根据您的设计调整 */
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 10px; /* 圆角 */
  overflow: hidden; /* 确保内容不溢出圆角 */
  box-sizing: border-box; /* 让 border 和 padding 不撑大元素 */
}

/* 禁用状态样式 */
.time-slot.disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  border-color: #eee;
}

/* 选中状态样式 */
.time-slot.selected {
  background-color: #a0d8ef; /* 示例选中背景色 */
  border-color: #a0d8ef; /* 示例选中边框色 */
}

/* 如果需要调整每行显示的格子数量，您可能需要调整 .time-slot 的宽度，或者使用 flexbox/grid 布局的更高级特性 */
/* 但为了遵守不修改复杂样式的要求，这里仅提供基础固定宽度 */

</style>
