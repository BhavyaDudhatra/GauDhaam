export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  createdAt: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  image: string;
  createdAt: string;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: "user" | "admin";
  body: string;
  createdAt: string;
};

export type MessageThread = {
  id: string;
  userId: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
};
