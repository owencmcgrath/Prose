class Prose < Formula
  # feel free to change this if you want a different description
  desc "A modern markdown editor and document management application"
  homepage "https://github.com/owencmcgrath/Prose"
  url "https://github.com/owencmcgrath/Prose/archive/refs/heads/main.tar.gz"
  sha256 "c207b238ad3cd0e83ccf3cb3b3857eb0be58f4bbfb2fb3a7d64014e39ade4e82"
  license "MIT"

  depends_on "node"
  depends_on "npm"

  def install
    system "npm", "install"
    system "npm", "run", "dist:mac"
    
    app_file = Dir["dist/mac/*.app"].first
    if app_file
      prefix.install app_file
    else
      odie "Could not find built Prose.app in dist/mac/"
    end
  end

  def caveats
    <<~EOS
      Prose has been installed to #{prefix}.
      
      This is a modern markdown editor with document management capabilities.
      You can launch it by running: open #{prefix}/Prose.app
      
      Note: On first launch, you may need to allow the app in 
      System Preferences > Security & Privacy if prompted.
    EOS
  end

  test do
    assert_predicate prefix/"Prose.app", :exist?
  end
end