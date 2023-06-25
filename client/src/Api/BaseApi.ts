namespace BaseApi {
  const baseUrl = `${window.location.protocol}//${window.location.host}/api`;

  export async function get(path: string): Promise<Response> {
    return await fetch(`${baseUrl}/${path}`, {
      method: "GET",
      credentials: "include",
    });
  }
}

export default BaseApi;