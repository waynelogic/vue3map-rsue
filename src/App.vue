<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import SiteHeader from "@/components/SiteHeader.vue";

const props = defineProps({
    title: {
        type: String,
    }
})
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <SiteHeader/>
        <main>
            <RouterView />
        </main>
    </div>
</template>

<style scoped>

</style>
