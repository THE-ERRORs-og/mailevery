export function parseServerActionResponse(response) {
  return JSON.parse(JSON.stringify(response));
}

export function parseServerActionError(error) {
  return JSON.parse(JSON.stringify(error));
}


