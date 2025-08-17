import { Server, Socket } from 'socket.io';
import { ForumService } from '../services/forum.service';

const forumService = new ForumService();

export function registerChatSockets(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Chat socket connected: ${socket.id}`);
    
    // Handle joining specific threads/rooms
    socket.on('join_thread', (threadId: string) => {
      // Leave previous rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
      
      // Join new thread room
      socket.join(threadId);
      console.log(`Socket ${socket.id} joined thread ${threadId}`);
    });

    // Updated typing events to use rooms
    socket.on('typing', (payload: { threadId: string; userName: string }) => {
      socket.to(payload.threadId).emit('typing', payload);
    });
    
    socket.on('stop_typing', (payload: { threadId: string; userName: string }) => {
      socket.to(payload.threadId).emit('stop_typing', payload);
    });

    // Rest of your existing socket handlers...
    socket.on('delete_question', async (questionId: string) => {
      if (!questionId) return;
      try {
        await forumService.deleteQuestion(questionId);
        io.emit('question_deleted', { id: questionId });
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    });

    socket.on('delete_answer', async ({ answerId, questionId }: { answerId: string; questionId: string }) => {
      if (!answerId || !questionId) return;
      try {
        await forumService.deleteAnswer(answerId);
        io.emit('answer_deleted', { id: answerId, questionId });
      } catch (err) {
        console.error('Error deleting answer:', err);
      }
    });

    socket.on('delete_reply', async ({ replyId, questionId, answerId }: { replyId: string; questionId: string; answerId?: string }) => {
      if (!replyId || !questionId) return;
      try {
        await forumService.deleteReply(replyId);
        io.emit('reply_deleted', { id: replyId, questionId, answerId });
      } catch (err) {
        console.error('Error deleting reply:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Chat socket disconnected: ${socket.id}`);
    });
  });
}


// Example HTTP endpoint integration (e.g., in your Express routes)
export function setupForumRoutes(app: any, io: Server): void {
  // POST QUESTION
  app.post('/api/forum/questions', async (req: any, res: any) => {
    try {
      const { question, author, category, authorType, imageUrls = [] } = req.body;
      if (!question || !author || !authorType || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const qDoc = await forumService.createQuestion({
        question,
        category,
        author,
        authorType,
        imageUrls,
      });
      io.emit('new_question', qDoc); // Emit to all clients
      res.status(201).json(qDoc);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST ANSWER
  app.post('/api/forum/answers', async (req: any, res: any) => {
    try {
      const { forum_question_id, text, author, authorType, imageUrls = [] } = req.body;
      if (!forum_question_id || !text || !author || !authorType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const aDoc = await forumService.createAnswer({
        forum_question_id,
        text,
        author,
        authorType,
        imageUrls,
      });
      io.emit('new_answer', aDoc); // Emit to all clients
      res.status(201).json(aDoc);
    } catch (error) {
      console.error('Error creating answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST REPLY
  app.post('/api/forum/replies', async (req: any, res: any) => {
    try {
      const { forum_answer_id, parent_reply_id, text, author, authorType, imageUrls = [] } = req.body;
      if (!forum_answer_id || !text || !author || !authorType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const rDoc = await forumService.createReply({
        forum_answer_id,
        parent_reply_id,
        text,
        author,
        authorType,
        imageUrls,
      });
      io.emit('new_reply', rDoc); // Emit to all clients
      res.status(201).json(rDoc);
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // DELETE QUESTION
app.delete('/api/forum/questions/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await forumService.deleteQuestion(id);
    io.emit('question_deleted', { id });
    res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Similarly for /api/forum/answers/:id and /api/forum/replies/:id

}