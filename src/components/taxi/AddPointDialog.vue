<!-- components/AddPointDialog.vue -->
<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div class="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 class="text-xl font-bold mb-4">Добавить точку</h2>
            <div class="flex justify-end gap-4">
                <button @click="addPoint" class="bg-blue-500 text-white px-4 py-2 rounded-md">Добавить</button>
                <button @click="close" class="bg-gray-300 px-4 py-2 rounded-md">Отмена</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";

const show = ref(false);
const emits = defineEmits(["add", "close"]);

const addPoint = () => emits("add");
const close = () => emits("close");

</script>

<style scoped>
/* Add custom styling here if needed */
</style>
