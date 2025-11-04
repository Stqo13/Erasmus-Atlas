<script setup lang="ts">
const props = withDefaults(defineProps<{ tone?: 'plum'|'sky'|'rose'|'ink' }>(), { tone: 'plum' })
</script>

<template>
  <span class="chip text-white" :class="{
    'bg-plum': props.tone==='plum',
    'bg-sky text-ink': props.tone==='sky',
    'bg-rose text-ink': props.tone==='rose',
    'bg-ink': props.tone==='ink',
  }"><slot /></span>
</template>
