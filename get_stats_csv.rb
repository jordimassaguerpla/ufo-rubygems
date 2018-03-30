require "yaml"

stats = {}

Dir.chdir("ruby-advisory-db") do
  Dir.entries("gems").each do |gem|
    next if !File.directory?("gems/#{gem}")
    $stderr.puts "\nParsing gem #{gem}"
    $stderr.puts "|"
    issues = Dir.entries("gems/#{gem}")
    issues.each do |issue|
      next if File.directory?(issue)
      next if !issue.end_with?(".yml")
      $stderr.puts "-- Parsing #{issue}"
      data = YAML::load(File.read("gems/#{gem}/#{issue}"))
      next unless data
      if data["cve"]
        issue_id = "cve-#{data["cve"]}"
      elsif data["osvdb"]
        issue_id = "osvdb-#{data["osvdb"]}"
      else
        $stderr.puts "** error: no cve nor osvdb information for #{issue} **"
        next
      end
      if !data["date"]
        $stderr.puts "** error: no date for #{issue} **"
        next
      end
      issue_year = data["date"].year
      $stderr.puts "   year: #{issue_year}"
      stats[issue_year] ||= {}
      stats[issue_year][data["gem"]] ||= []
      stats[issue_year][data["gem"]] << issue_id
    end
  end

  puts "year,name,issues"
  stats.keys.sort.each do |year|
    stats[year].each do |name, issues|
      puts "#{year},#{name},#{issues.length}"
    end
  end
end
