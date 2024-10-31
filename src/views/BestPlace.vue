<script setup>
import 'leaflet'
import {computed, onMounted, ref, watch} from "vue";
import {MapIcon, XMarkIcon} from "@heroicons/vue/24/outline/index.js";
import {LIcon, LMap, LMarker, LPolyline, LTileLayer, LTooltip} from "@vue-leaflet/vue-leaflet";
import Openrouteservice from 'openrouteservice-js'
import polyline from "@mapbox/polyline";
import {ls} from "@/utils/ls.js";
// Компоненты
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import PageContainer from "@/components/PageContainer.vue";
import ContextMenu from "@/components/Actions/ContextMenu.vue";
import Button from "@/components/Actions/Button.vue";
// Иконки
import OzonIcon from "../assets/images/ozon.svg"
import pin from "../assets/images/pin.svg"

const map = ref(null);
const zoom = ref(13);
const center = ref([47.23136, 39.68712]);
const me = ref(null);
const meAddress = ref(null);
const onlyBest = ref(true);

let rounded = function(number){
    return +number.toFixed(2);
}

// Найти меня на карте
const findMe = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        let pos = [position.coords.latitude, position.coords.longitude];
        center.value = pos;
        ls.set('center', center.value);
        if (!me.value) me.value = {lat: pos[0], lng: pos[1]}
    })
}
const setMe = (e) => {
    me.value = clickedPlace.value;
    isShownDialog.value = false;
}

// Работа с контекстным меню
const isShownDialog = ref(false);
const clickedPlace = ref(null);
const openDialog = (e) => {
    isShownDialog.value = true;
    clickedPlace.value = e.latlng;
}

const transportType = ref('driving-car');
const transportTypes = {
    'driving-car': 'На автомобиле 🚗',
    'foot-walking': 'Пешком 🚶',
}


const places = [
    {
        id: 1,
        name: 'Гвардейский',
        coords: [47.22486299786212, 39.691343483787364],
        color: 'red'
    },
    {
        id: 2,
        name: 'Площадь Гагарина',
        coords: [47.23608159302502, 39.71297223813748],
        color: 'blue'
    },
    {
        id: 3,
        name: 'Северный Рынок',
        coords: [47.28337991738959, 39.71559483702225],
        color: 'green'
    },
    {
        id: 4,
        name: 'Западный',
        coords: [47.22413187202859, 39.6220723371362],
        color: 'yellow'
    }
];

const routes = ref([])
const bestPlace = computed(() => {
    if (!routes.value) return null;
    let best = routes.value.sort((a, b) => a.distance - b.distance)[0];
    return places.find(place => place.id === best.id);
})
async function calculate() {
    if (!me.value) {
        alert('Где вы?');
        return;
    }

    let r = [];
    let orsDirections = new Openrouteservice.Directions({ api_key: "5b3ce3597851110001cf624879149d307d6b4a16a40e613400c88f69"});

    for (const place of places) {
        try {
            let response = await orsDirections.calculate({
                coordinates: [[me.value.lng, me.value.lat], [place.coords[1], place.coords[0]]],
                profile: transportType.value,
            })

            let route = response.routes[0];

            r.push({
                id: place.id,
                coords: polyline.decode(route.geometry),
                distance: route.summary.distance,
                duration: route.summary.duration,
                color: place.color
            })
        } catch (error) {
            console.error("Ошибка при расчете маршрута:", error);
        }
    }
    routes.value = r
}

onMounted(() => {
    center.value = ls.get('center') || [47.23136, 39.68712];
})
watch(me, async () => {
    if (me.value) {
        ls.set('me', me.value);
        console.log([me.value.lng, me.value.lat])
        let orsDirections = new Openrouteservice.Geocode({api_key: "5b3ce3597851110001cf624879149d307d6b4a16a40e613400c88f69"});

        let response_reverse = await orsDirections.reverseGeocode({
            point: {lat_lng: [me.value.lat, me.value.lng], radius: 50},
            boundary_country: ["RU"]
        })
        if (response_reverse.features.length) {
            meAddress.value = response_reverse.features[0].properties.label
        }
        if (routes.value.length) {
            await calculate()
        }
    }
})


const getRouteColor = (route) => {
    if (onlyBest.value) {
        if (route.id === bestPlace.value.id) {
            return 'blue';
        } else {
            return 'gray';
        }
    } else {
        return route.color;
    }
}
</script>

<template>
    <Breadcrumbs title="Лучшее место на карте"/>
    <PageContainer>
        <div class="flex gap-4 mb-4">
            <Button @click="findMe" theme="default">Найти меня</Button>
            <Button @click="calculate" theme="primary">Рассчет путей</Button>
            <select v-model="transportType" class="border-2 border-blue-500 rounded-lg px-4 py-2 focus:border-blue-700">
                <option v-for="(name, val, number) in transportTypes" :key="number" :value="val">
                    {{ name }}
                </option>
            </select>
            <label class="flex items-center gap-2 border p-2">
                <input type="checkbox" v-model="onlyBest">
                <span>Только лучший маршрут</span>
            </label>
        </div>
        <div class="text-xl mb-4">
            <span v-if="meAddress">
                Вы находитесь: {{ meAddress }}
            </span>
            <span v-else>
                Нажмите на карту праой кнопкой, чтобы установить местоположение или запросите координаты с помощью GPS
            </span>
        </div>

        <div class="border-2 border-gray-900 rounded-xl overflow-hidden w-full h-[500px]">
            <LMap ref="map" v-model:center="center" v-model:zoom="zoom" @contextmenu="openDialog">
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap"></LTileLayer>
                <LMarker v-for="place in places" :key="place.id" :lat-lng="place.coords">
                    <LTooltip>{{ place.name }}</LTooltip>
                    <LIcon :icon-url="OzonIcon" :icon-size="[40, 40]"/>
                </LMarker>
                <LMarker v-if="me" :lat-lng="me">
                    <LTooltip>Мое местоположение</LTooltip>
                    <LIcon :icon-url="pin" :icon-size="[40, 40]"/>
                </LMarker>
                <LPolyline v-if="routes" v-for="route in routes" :lat-lngs="route.coords" :color="getRouteColor(route)" />
            </LMap>
        </div>

        <div v-if="routes.length" class="flex flex-col gap-3 mt-2">
            <div class="flex items-center gap-4 p-3 border bg-white shadow" :style="{'--color': getRouteColor(route)}" v-for="route in routes" :key="route.id">
                Маршрут <span class="bg-[var(--color)] text-white px-2 py-1 rounded-md"> {{ route.id }}</span>: {{ rounded(route.distance / 1000) }} км, {{ Math.round(route.duration / 60) }} мин
            </div>
            <div>
                <h3>Лучшее место: {{ bestPlace.name }}</h3>
            </div>
        </div>

        <ContextMenu :show="isShownDialog" @close="isShownDialog = false">
            <ul class="[&>li]:border-b [&>li]:last:border-none w-full">
                <li>
                    <button type="button" @click="setMe" class="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
                        <MapIcon class="size-5"/>
                        <span>Я здесь</span>
                    </button>
                </li>
                <li>
                    <button type="button" @click="isShownDialog = false" class="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
                        <XMarkIcon class="size-5"/>
                        <span>Отмена</span>
                    </button>
                </li>
            </ul>
        </ContextMenu>
    </PageContainer>
</template>

<style scoped>

</style>