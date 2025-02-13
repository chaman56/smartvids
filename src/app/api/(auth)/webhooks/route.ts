import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if(body.type === 'session.ended'){
        return new NextResponse('User logged out successfully', {
            status: 200,
          });
    }
    else if(body.type === 'session.created'){
        return new NextResponse('User logged in successfully', {
            status: 200,
        });
    }
    else if( body.type === 'user.created'){
        const { id, email_addresses, first_name, image_url } = body?.data;

        const email = email_addresses[0]?.email_address;

        let newUser = null;
        if(email){
           newUser = await db.user.create({
            data: {
              id: id,
              email: email,
              name: first_name || '',
              profileImage: image_url || '',
              projects : {
                create : []
              }
            }
          });
          console.log("User Created in database: ", newUser);
        }

        return new NextResponse('User created in database successfully', {
          status: 200,
        });
    }
    else if(body.type === 'user.deleted'){
      try{
          await db.user.delete({
            where: {id: body.data.id},
          })
          console.log("User deleted from database: ", body.data.id);
          return new NextResponse('User deleted from database successfully', {status: 200})
      }catch(err){
        return new NextResponse('Error deleting User from database', {status: 500})
      }
    };
  } catch (err: any) {
    console.log('Error creating user in database: ', err.message);
    return new NextResponse('Error creating user in database', { status: 500 });
  }
}
