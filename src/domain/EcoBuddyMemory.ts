export interface ChatContextMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

/**
 * Domain entity managing the session chat memories, interaction states, and message queues.
 */
export class EcoBuddyMemoryDomain {
  private messages: ChatContextMessage[] = [];

  constructor(
    public readonly sessionKey: string,
    initialMessages: ChatContextMessage[] = []
  ) {
    this.messages = [...initialMessages];
  }

  /**
   * Appends an interaction to the assistant buffer.
   */
  public addMessage(sender: 'user' | 'assistant', text: string): ChatContextMessage {
    const newMessage: ChatContextMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(newMessage);
    return newMessage;
  }

  /**
   * Returns all stored messages for the current chat window.
   */
  public getMessages(): ChatContextMessage[] {
    return [...this.messages];
  }

  /**
   * Compiles conversation logs into standard format for backlogs.
   */
  public formatConversationLog(): string {
    return this.messages
      .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');
  }
}
