import { Request, Response } from 'express';
import { getPost } from '../fake-db';

export const showPost = (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postid);
    
    if (isNaN(postId)) {
      return res.status(400).send('Invalid post ID');
    }

    const post = getPost(postId);
    
    if (!post) {
      return res.status(404).render('404', { message: 'Post not found' });
    }
    
   
    res.render('posts/individualPost', { 
      post,
      user: req.user 
    });
    
  } catch (error) {
    console.error('Error showing post:', error);
    res.status(500).send('Server error');
  }
};

