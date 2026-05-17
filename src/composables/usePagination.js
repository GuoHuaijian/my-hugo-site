import { computed, ref, watch } from 'vue'

export function usePagination(items, perPage = 8) {
  const page = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / perPage)))
  const pagedItems = computed(() => items.value.slice((page.value - 1) * perPage, page.value * perPage))

  watch(items, () => {
    page.value = 1
  })

  return { page, totalPages, pagedItems }
}
