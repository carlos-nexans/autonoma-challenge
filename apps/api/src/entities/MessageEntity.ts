import { Entity, Column, ManyToOne, CreateDateColumn, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Thread } from './ThreadEntity';
import type { Provider } from '@repo/api';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    publicId: string;

    @Column('text', { name: 'thread_id' })
    threadId: string;

    @Column('text')
    role: "user" | "assistant";

    @Column('text')
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Thread, thread => thread.messages)
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @Column('text', { nullable: true })
    provider: Provider | null;

    @Column('text', { nullable: true })
    id: string | null;
}