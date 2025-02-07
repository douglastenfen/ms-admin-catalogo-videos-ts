import { InMemoryStorage } from '../in-memory.storage';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('store', () => {
    it('should store data in the storage', async () => {
      const data = Buffer.from('test data');
      const id = 'test-id';
      const mimeType = 'text/plain';

      await storage.store({ data, id, mimeType });

      const storedData = storage['storage'].get(id);

      expect(storedData).toEqual({ data, mimeType });
    });
  });

  describe('get', () => {
    it('should return the stored data', async () => {
      const data = Buffer.from('test data');
      const id = 'test-id';
      const mimeType = 'text/plain';

      await storage.store({ data, id, mimeType });

      const storedData = await storage.get(id);

      expect(storedData).toEqual({ data, mimeType, id });
    });
  });
});
