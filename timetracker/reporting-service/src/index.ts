import express from 'express';
import bodyParser from 'body-parser';
import * as amqp from 'amqplib';

type TotalsByUser = Record<string, number>;

const app = express();
app.use(bodyParser.json());

const totals: TotalsByUser = {};

async function initRabbit() {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();

    await ch.assertExchange('time.entries', 'topic', { durable: true });

    const q = await ch.assertQueue('reporting-service-queue', {
      durable: true,
    });

    await ch.bindQueue(q.queue, 'time.entries', 'time.entry.created');

    ch.consume(
      q.queue,
      (msg) => {
        if (!msg) return;
        const content = msg.content.toString();
        const entry = JSON.parse(content) as {
          userId: string;
          hours: number;
        };
        totals[entry.userId] = (totals[entry.userId] || 0) + entry.hours;
        ch.ack(msg);
      },
      { noAck: false },
    );

    console.log('Reporting Service consuming events from RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection error (reporting):', err);
  }
}

app.get('/stats', (req, res) => {
  res.json({
    totalsByUser: totals,
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Reporting Service listening on port ${port}`);
  initRabbit();
});
