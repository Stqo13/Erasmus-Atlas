<script setup lang="ts">
const props = withDefaults(defineProps<{ variant?: 'primary'|'ghost'|'outline', type?: 'button'|'submit' }>(), {
  variant: 'primary',
  type: 'button'
})
</script>

<template>
  <button :type="props.type" class="btn" :class="{
    'btn-primary': props.variant==='primary',
    'btn-ghost': props.variant==='ghost',
    'btn-outline': props.variant==='outline',
  }">
    <slot />
  </button>
</template>
