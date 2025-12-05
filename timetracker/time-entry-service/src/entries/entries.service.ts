import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

type Entry = {
  id: number;
  userId: string;
  project: string;
  date: string;
  hours: number;
};

@Injectable()
export class EntriesService {
  private entries: Entry[] = [];
  private idSeq = 1;
  private channel: amqp.Channel | null = null;

  constructor() {
    this.initRabbit();
  }

  private async initRabbit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      await ch.assertExchange('time.entries', 'topic', { durable: true });
      this.channel = ch;
      console.log('Connected to RabbitMQ from Time Entry Service');
    } catch (err) {
      console.error('RabbitMQ connection error:', err);
    }
  }

  private publishEvent(eventType: string, payload: any) {
    if (!this.channel) return;
    const routingKey = `time.entry.${eventType}`;
    this.channel.publish(
      'time.entries',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  findAll() {
    return this.entries;
  }

  findOne(id: number) {
    return this.entries.find((e) => e.id === id);
  }

  create(dto: { userId: string; project: string; date: string; hours: number }) {
    const entry: Entry = {
      id: this.idSeq++,
      ...dto,
    };
    this.entries.push(entry);
    this.publishEvent('created', entry);
    return entry;
  }
}
