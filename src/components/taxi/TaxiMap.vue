<script setup>
import 'leaflet'
import "leaflet/dist/leaflet.css";
import {LMap, LMarker, LPolyline, LTileLayer} from "@vue-leaflet/vue-leaflet";
import {computed, onMounted, ref, watch} from "vue";
import Button from "@/components/Actions/Button.vue";
import {ListBulletIcon} from "@heroicons/vue/24/solid/index.js";
import AddPointDialog from "@/components/taxi/AddPointDialog.vue";
import axios from "axios";
import polyline from "@mapbox/polyline";
import {money} from "@/utils/money.js";

const zoom = ref(13);
const center = ref([47.41322, -1.219482]);
const kmPrice = ref(50);

const dialogVisible = ref(false);
const selectedPosition = ref(null);
const markers = ref([]);

const route = ref(null);
const distance = ref(null);

const price = computed(() => parseInt(distance.value) * parseInt(kmPrice.value) / 1000);
const findMe = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords);
        center.value = [position.coords.latitude, position.coords.longitude]
        localStorage.setItem('center', JSON.stringify(center.value));
    })
}

const openDialog = (e) => {
    selectedPosition.value = e.latlng;
    dialogVisible.value = true;
};
const addPoint = () => {
    markers.value.push(selectedPosition.value);
    dialogVisible.value = false;
};
const removePoint = (index) => {
    markers.value.splice(index, 1);
    if (route.value) {
        calculateRoute()
    }
};
watch(markers, () => {
    localStorage.setItem('points', JSON.stringify(markers.value));
    if (markers.value.length < 2) {
        route.value = null
    }
})

const clearPoints = () => {
    markers.value = [];
}

async function calculateRoute() {
    if (markers.value.length < 2) {
        alert("Добавьте как минимум две точки для расчета маршрута.");
        return;
    }

    const apiKey = '5b3ce3597851110001cf624879149d307d6b4a16a40e613400c88f69';

    // Формируем массив координат в формате [longitude, latitude]
    const coordinates = markers.value.map(marker => [marker.lng, marker.lat]);
    // console.log(coordinates)

    try {
        const response = await axios.post(`https://api.openrouteservice.org/v2/directions/driving-car`, {
            coordinates: coordinates,
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            }
        });
        route.value = polyline.decode(response.data.routes[0].geometry);
        distance.value = response.data.routes[0].summary.distance;
    } catch (error) {
        console.error("Ошибка при расчете маршрута:", error);
    }
}

onMounted(() => {
    center.value = JSON.parse(localStorage.getItem('center')) || [47.41322, -1.219482];
    markers.value = JSON.parse(localStorage.getItem('points')) || [];
})

const table = computed(() => [
    {
        name: 'Текущий центр',
        data: center.value
    },
    {
        name: 'Диалог добавления точки',
        data: dialogVisible.value
    }
])
</script>

<template>
    <details class="border shadow rounded-xl mb-5">
        <summary class="flex items-center justify-between px-4 py-6 focus:outline-none cursor-pointer">
            <h1 class="text-2xl font-bold">Данные</h1>
            <ListBulletIcon class="w-6 h-6"/>
        </summary>
        <div class="relative rounded-b-xl overflow-auto border-t">
            <div class="shadow-sm overflow-hidden">
                <table class="border-collapse table-fixed w-full text-sm">
                    <tbody class="bg-white dark:bg-slate-800">
                        <tr v-for="(item, number) in table" :key="number">
                            <td class="border-b border-slate-100 dark:border-slate-700 p-4 first:pl-8 last:pr-8 text-slate-500 dark:text-slate-400">
                                {{ item.name }}
                            </td>
                            <td class="border-b border-slate-100 dark:border-slate-700 p-4 first:pl-8 last:pr-8 text-slate-500 dark:text-slate-400">
                                {{ item.data }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </details>
    <div class="border-2 border-gray-900 rounded-xl overflow-hidden w-full h-[500px]">
        <LMap ref="map" v-model:center="center" v-model:zoom="zoom" @contextmenu="openDialog">
            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap"></LTileLayer>
            <LMarker :draggable="true" v-for="(marker, number) in markers" :key="number" :lat-lng="marker"/>
            <LPolyline v-if="route" :lat-lngs="route" color="blue" />
        </LMap>
    </div>
    <div class="flex gap-4 pt-6">
        <Button @click="findMe" type="primary">Найти меня</Button>
        <Button @click="calculateRoute" type="primary-outline">Рассчет путей</Button>
        <Button type="danger" @click="clearPoints">Удалить все точки</Button>
    </div>

    <div class="inline-flex gap-4 my-2" v-if="distance">
        <label class="flex flex-col gap-2 border p-2">
            <span>Стоимость километра:</span>
            <input type="number" v-model="kmPrice">
        </label>
        <label class="flex flex-col gap-2 border p-2">
            <span>Стоимость маршрута:</span>
            <span>
                {{ money(price) }}
            </span>
        </label>
        <label class="flex flex-col gap-2 border p-2">
            <span>Общая дистанция:</span>
            <span>
                {{ Math.round(distance / 1000) }} км ({{ distance }} метров)
            </span>
        </label>

    </div>

    <div class="flex flex-col">
        <h2 class="text-3xl font-bold">Список точек</h2>
        <template v-if="markers.length">
            <ul class="flex flex-col gap-2">
                <li class="flex items-center gap-2 border-2 border-gray-900 p-4 rounded-xl" v-for="(marker, number) in markers" :key="number">
                    <ListBulletIcon class="w-6 h-6"/>
                    <p>Точка {{ number + 1 }}: {{ marker }}</p>
                    <Button type="danger" @click="removePoint(number)">Удалить</Button>
                </li>
            </ul>
        </template>
        <template v-else>
            <p>Нет точек. Для добавления нажмите правой кнопкой мыши на карте</p>
        </template>
    </div>

    <AddPointDialog v-if="dialogVisible"  @add="addPoint" @close="dialogVisible = false" />

</template>

<style scoped>

</style>