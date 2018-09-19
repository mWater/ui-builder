export default () => {
  return {
    query: jest.fn(),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
    addRow: jest.fn(),
    updateRow: jest.fn(),
    removeRow: jest.fn()
  }
}
