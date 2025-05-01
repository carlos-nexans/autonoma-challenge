import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Thread } from './thread.entity';

@Entity('messages')
export class Message {
    @PrimaryColumn('text')
    id: string;

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
}