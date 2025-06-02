<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar' 
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <RouterView />
    </main>
  </SidebarProvider>
</template>

<style scoped></style>
