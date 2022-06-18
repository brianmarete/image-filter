import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  /**
   * @api {get} /filteredimage GET an image from the URL and filter it
   * @apiQuery {String} image_url URL of the image to filter
   * 
   * @apiSuccess {File} image Filtered image
   */
  app.get( "/filteredimage", async ( req: Request, res: Response ) => {
    const { image_url } = req.query;
    if (!image_url) {
      return res.status(400).send('Image url is required');
    }

    try {
      const filteredpath: string = await filterImageFromURL(image_url);
    
      res.sendFile(filteredpath, async (err) => {
        if (err) {
          throw err;
        } else {
          await deleteLocalFiles([filteredpath]);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).send(error.message);
      }
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();