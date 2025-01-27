import { AuthOptions, getServerSession } from "next-auth"
import TwitterProvider from "next-auth/providers/twitter";
import Creator from "@/models/Creator";

const authOptions = {
    providers: [
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID || "",
        clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
        version: "2.0",
      })
    ],
    callbacks: {
      async signIn({ user, account, profile }: { user: any, account: any, profile: any }) {
        try {
        //   console.log("profile", profile);
        //   console.log("user", user);
        //   console.log("account", account);
          await Creator.findOneAndUpdate(
            { twitterId: profile.data.id },
            {
              name: profile.data.name,
              username: profile.data.username,
              profileImage: profile.data.profile_image_url,
              lastLogin: new Date(),
            },
            { upsert: true, new: true }
          );

          console.log("Creator updated successfully");
  
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      },
      async jwt({ token, account, profile }: { token: any, account: any, profile: any }) {
        if (account && profile) {
          token.accessToken = account.access_token;
          token.twitterId = profile.data.id;
        }
        return token;
      },
      async session({ session, token }: { session: any, token: any }) {
        if (session.user) {
          try {
            // Fetch creator data from MongoDB
            const creator = await Creator.findOne({ 
              twitterId: token.twitterId 
            });
            
            if (creator) {
              session.user.twitterId = creator.twitterId;
            //   session.user.walletAddress = creator.walletAddress;
              session.user.username = creator.username;
              session.user.profileImage = creator.profileImage;
              session.user.name = creator.name;
            }
            
            session.accessToken = token.accessToken;
          } catch (error) {
            console.error("Error fetching creator data:", error);
          }
        }
        return session;
      }
    },
    session: {
      strategy: 'jwt',
    },
  }

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * @returns The session object or null
 */
const getSession = () => getServerSession(authOptions as any)  

export { authOptions, getSession }