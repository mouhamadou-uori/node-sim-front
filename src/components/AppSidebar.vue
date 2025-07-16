<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupLabel,
} from '@/components/ui/sidebar'
import ComponentLibrary from './ComponentLibrary.vue'
</script>

<template>
    <Sidebar>
        <SidebarHeader class="border-b border-gray-200">
            <div class="px-4 py-3">
                <h2 class="text-lg font-semibold text-gray-800">Node-sim</h2>
                <p class="text-sm text-gray-600">Component Library</p>
            </div>
        </SidebarHeader>
        <SidebarContent class="p-4">
            <ComponentLibrary />
        </SidebarContent>
        <SidebarFooter class="border-t border-gray-200 p-4">
            <div class="text-xs text-gray-500 text-center">
                Drag & drop components to workspace
            </div>
        </SidebarFooter>
    </Sidebar>
</template>
