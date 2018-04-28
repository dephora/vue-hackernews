jest.mock('../../api/api.js')
jest.useRealTimers()

import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import ItemList from '../ItemList.vue'
import Item from '../../components/Item.vue'

describe('ItemList.vue', () => {
  const localVue = createLocalVue() // #A
  localVue.use(Vuex) // #B
  let actions // #C
  let getters
  let store

  beforeEach(() => {
    actions = {
      fetchListData: jest.fn(() => Promise.resolve()) // #D
    }
    getters = {
      displayItems: jest.fn() // #E
    }
    store = new Vuex.Store({ // #F
      state: {},
      getters,
      actions
    })
  })

  test('renders an Item for each item in displayItems getter', async () => {
    const $bar = {
      start: () => {},
      finish: () => {}
    }
    const items = [{}, {}, {}]
    getters.displayItems.mockReturnValue(items) // #G
    const wrapper = mount(ItemList, {mocks: {$bar}, localVue, store}) // #H
    await flushPromises()
    expect(wrapper.findAll(Item).length).toBe(items.length)
  })

  test('passes an item object to each Item component', () => {
    const $bar = {
      start: () => {},
      finish: () => {}
    }
    const items = [{}, {}, {}]
    getters.displayItems.mockReturnValue(items)
    const wrapper = mount(ItemList, {mocks: {$bar}, localVue, store})
    const Items = wrapper.findAll(Item)
    Items.wrappers.forEach((wrapper, i) => {
      expect(wrapper.vm.item).toBe(items[i])
    })
  })

  test('calls $bar start on load', () => {
    const $bar = {
      start: jest.fn(),
      finish: () => {}
    }
    mount(ItemList, {mocks: {$bar}, localVue, store})
    expect($bar.start).toHaveBeenCalled()
  })

  test('calls $bar finish when load succesful', async () => {
    const $bar = {
      start: () => {},
      finish: jest.fn()
    }
    mount(ItemList, {mocks: {$bar}, localVue, store})
    await flushPromises()
    expect($bar.finish).toHaveBeenCalled()
  })

  test('dispatches fetchListData with top', async () => {
    const $bar = {
      start: () => {},
      finish: () => {}
    }
    store.dispatch = jest.fn(() => Promise.resolve()) // #I
    mount(ItemList, {mocks: {$bar}, localVue, store})
    expect(store.dispatch).toHaveBeenCalledWith('fetchListData', {type: 'top'}) // #J
  })

  test('calls $bar fail when fetchListData throws', async () => {
    const $bar = {
      start: jest.fn(),
      fail: jest.fn()
    }
    actions.fetchListData.mockRejectedValue() // #A
    mount(ItemList, {mocks: {$bar}, localVue, store}) // #B
    await flushPromises() // #C
    expect($bar.fail).toHaveBeenCalled() // #D
  })
})
