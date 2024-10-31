<script setup>
import {onMounted, ref} from "vue";

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    placeToListen: {
        type: Object,
        default: window
    }
})

const emit = defineEmits(['close']);

const x = ref(0);
const y = ref(0);

onMounted(() => {
    props.placeToListen.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        x.value = e.clientX;
        y.value = e.clientY;
    })
})
</script>

<template>
    <div v-if="show" class="fixed inset-0" @click="$emit('close')"></div>
    <div v-if="show" :style="{left: x + 'px', top: y + 'px'}"
         class="absolute min-w-36 inline-flex bg-white border shadow rounded-xl overflow-hidden z-[999]">
        <slot/>
    </div>
</template>

<style scoped>

</style>