export interface Job<Data> {
  data: Data
}

type Processor<Data> = (job: Job<Data>) => Promise<void> | void

const processors = new Map<string, Processor<any>>()
const queues = new Map<string, Job<any>[]>()

function flush(name: string) {
  const processor = processors.get(name)
  if (!processor) return
  const list = queues.get(name) ?? []
  while (list.length) {
    const job = list.shift()!
    Promise.resolve().then(() => processor(job))
  }
}

export class Queue<Data> {
  constructor(public name: string) {}

  async add(jobName: string, data: Data) {
    const list = queues.get(this.name) ?? []
    list.push({ data })
    queues.set(this.name, list)
    flush(this.name)
  }
}

export class Worker<Data> {
  constructor(
    public name: string,
    processor: Processor<Data>
  ) {
    processors.set(name, processor)
    flush(name)
  }
}
