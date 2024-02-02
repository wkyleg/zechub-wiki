'use server';

import { mongodbClient } from '@/lib/db-connectors/mongo-db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const mongo = {
  mongodbClient,
  db: mongodbClient.db('zechub-wiki'),
  collectionName: 'webpushSubscribersWelcomeMessage',
};

export type SubscriberWelcomeMessageType = {
  title: string;
  body: string;
  icon: string;
  image: string;
};
export async function handlerCreateSubscriberWelcomeMessage(
  formData: FormData
) {
  const schema = z.object({
    title: z.string().min(5),
    body: z.string().min(10),
    icon: z.string(),
    image: z.string(),
  });

  const d = schema.parse({
    title: formData.get('title'),
    body: formData.get('body'),
    icon: formData.get('icon'),
    image: formData.get('image'),
  });

  try {
    const webpushSubscribers = mongo.db.collection(mongo.collectionName);
    const res = await webpushSubscribers.insertOne(d);

    revalidatePath('/');
    return {
      data: {
        insertedId: JSON.stringify(res.insertedId),
      },
    };
  } catch (err) {
    console.error({
      description: 'handlerCreateSubscriberWelcomeMessage',
      data: err,
    });
    return { data: 'Failed to save data.' };
  }
}

export async function getSubscriberWelcomeMessage(): Promise<{
  data: SubscriberWelcomeMessageType[] | string;
}> {
  try {
    const webpushSubscribers = mongo.db.collection(mongo.collectionName);
    const cursor = webpushSubscribers.find();

    const data = await cursor.toArray();

    const parseData: SubscriberWelcomeMessageType[] = data.map((d) => {
      return {
        title: d.title,
        body: d.body,
        id: d._id.toString(),
        icon: d.icon,
        image: d.image,
      };
    });

    return {
      data: parseData,
    };
  } catch (err) {
    console.error({
      description: 'getSubscriberWelcomeMessage',
      data: err,
    });
    return { data: 'Failed to fetch data.' };
  }
}