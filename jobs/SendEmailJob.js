import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queueConfig.js";
import logger from "../config/logger.js";
import { sendMail } from "../helpers/mailer.js";

// Unique Queue name
export const emailQueueName = "email-queue";

// Make Queue object 
export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

// * Workers 
export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log("the email worker data is", job.data);
    const data = job.data;
    data?.map(async (item) => {
      await sendMail(item.email, item.subject, item.content);
    });
  },
  { connection: redisConnection }
);

// Worker listerners completed
handler.on("completed", (job) => {
  logger.info({ job: job, message: "Job completed" });
  console.log(`the job ${job.id} is completed`);
});

// Worker listerners completed
handler.on("failed", (job) => {
  console.log(`the job ${job.id} is failed`);
});
