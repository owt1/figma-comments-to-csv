import fetch from "node-fetch";
import * as stringifySync from "csv-stringify/lib/sync";
import * as fs from "fs";
import * as yargs from "yargs";

interface Comment {
  id: string;
  order_id: string;
  parent_id: string;
  name: string;
  message: string;
  url: string;
  created_at: string;
  file_key: string;
}

const argv = yargs.options({
  key: { type: "string", description: "figma file key", demandOption: true },
  token: { type: "string", description: "figma token", demandOption: true },
}).argv;

async function getComments({ key, token }: Record<"key" | "token", string>) {
  const comments = await fetch(
    `https://api.figma.com/v1/files/${key}/comments`,
    {
      method: "GET",
      headers: {
        "x-Figma-Token": token,
      },
    }
  );
  return comments.json();
}

function generateCsv(comments: Comment[]) {
  const csvString = stringifySync(comments, {
    header: true,
    columns: {
      id: "id",
      order_id: "order_id",
      parent_id: "parent_id",
      name: "name",
      message: "message",
      url: "url",
      created_at: "created_at",
      file_key: "file_key",
    },
    quoted_string: true,
  });
  fs.writeFileSync(`figma_comments_${comments[0].file_key}.csv`, csvString);
}

function main() {
  getComments({
    key: argv.key,
    token: argv.token,
  }).then((res) => {
    const comments = res.comments.map((comment) => {
      return {
        id: comment.id,
        order_id: comment.order_id,
        parent_id: comment.parent_id,
        name: comment.user.handle,
        message: comment.message,
        url: `https://www.figma.com/file/${comment.file_key}?node-id=${
          comment.client_meta?.node_id
        }#${comment.order_id === null ? comment.parent_id : comment.id}`,
        created_at: comment.created_at,
        file_key: comment.file_key,
      };
    });
    generateCsv(comments);
  });
}

module.exports = main;
