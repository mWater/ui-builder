export default () => {
  return {
    query: jest.fn(),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
    transaction: jest.fn()
  }
}
