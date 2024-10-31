<script setup lang="ts">
import {computed, PropType} from "vue";
const props = defineProps({
    theme: {
        type: String as PropType<'default' | 'primary' | 'primary-outline' | 'danger'>,
        default: 'default'
    }
})

const styleClass = computed(() => {
    return {
        'default': 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        'primary': 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
    }[props.theme]
})
</script>

<template>
    <button :class="styleClass" class="inline-flex items-center rounded-md px-3 py-3 text-sm font-semibold shadow-sm duration-300">
        <slot/>
    </button>
</template>

<style scoped>

</style>